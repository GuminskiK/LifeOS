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
    session: AsyncSession = Depends(db_session),
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    post_type: Optional[PostType] = Query(None, description="Filtruj po typie posta (np. video, short, text)"),
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
    session: AsyncSession = Depends(db_session),
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    post_type: Optional[PostType] = Query(None, description="Filtruj po typie posta (np. video, short, text)"),
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