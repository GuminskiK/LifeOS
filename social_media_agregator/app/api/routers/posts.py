from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional

from app.api.deps import db_session
from app.models.Posts import Post, PostRead, PostType
from app.models.Platforms import Platform
from app.models.Creators import Creator

router = APIRouter(prefix="/feed", tags=["feed"])

@router.get("/global", response_model=List[PostRead])
async def get_global_feed(
    session: db_session,
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    post_type: Optional[PostType] = Query(None),
):
    """
    Pobiera globalny feed wszystkich treści ze wszystkich platform, 
    posortowany chronologicznie (od najnowszych).
    """
    statement = select(Post)
    
    if post_type:
        statement = statement.where(Post.post_type == post_type)

    statement = (statement
        .order_by(desc(Post.created_at))
        .offset(offset)
        .limit(limit)
    )
    results = await session.exec(statement)
    return results.all()

@router.get("/creator/{creator_id}", response_model=List[PostRead])
async def get_creator_feed(
    creator_id: int,
    session: db_session,
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    post_type: Optional[PostType] = Query(None),
):
    """
    Pobiera feed treści dla konkretnego twórcy, agregując posty ze wszystkich jego platform.
    """
    # Weryfikacja czy twórca istnieje
    creator = await session.get(Creator, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator nie został znaleziony")

    statement = (select(Post)
        .join(Platform)
        .where(Platform.creator_id == creator_id)
    )
    if post_type:
        statement = statement.where(Post.post_type == post_type)
        
    statement = (statement.order_by(desc(Post.created_at))
        .offset(offset)
        .limit(limit)
    )
    results = await session.exec(statement)
    return results.all()

@router.get("/single/{post_id}", response_model=PostRead)
async def get_single_post(
    post_id: int,
    session: db_session,
):
    """
    Pobiera pojedynczy post po ID.
    """
    post = await session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    return post

@router.get("/stats/summary")
async def get_posts_summary(
    session: db_session,
):
    """
    Zwraca liczbę postów per typ (long form, short, story, post).
    """
    from sqlalchemy import func
    from app.models.Posts import PostType
    result = await session.exec(
        select(Post.post_type, func.count(Post.id)).group_by(Post.post_type)
    )
    stats = {k.value if isinstance(k, PostType) else k: v for k, v in result}
    return stats