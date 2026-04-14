from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
from app.api.deps import db_session
from app.models.ScraperSettings import ScraperConfig, ScraperTriggerType
from app.models.AggregatorExtensions import FavoritePost
from app.models.Posts import Post, PostType
from app.models.Platforms import Platform
from app.models.Creators import Creator

router = APIRouter(prefix="/aggregator", tags=["aggregator"])

@router.get("/scraper-configs/{platform_id}", response_model=List[ScraperConfig])
async def get_scraper_configs(
    platform_id: int,
    session: AsyncSession = Depends(db_session)
):
    """
    Zwraca wszystkie konfiguracje scraperów dla danej platformy (różne typy treści).
    """
    result = await session.exec(
        select(ScraperConfig).where(ScraperConfig.platform_id == platform_id)
    )
    return result.all()

@router.post("/scraper-configs/{platform_id}", response_model=ScraperConfig)
async def add_scraper_config(
    platform_id: int,
    config: ScraperConfig,
    session: AsyncSession = Depends(db_session)
):
    config.platform_id = platform_id
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config

@router.patch("/scraper-configs/{config_id}", response_model=ScraperConfig)
async def update_scraper_config(
    config_id: int,
    config: ScraperConfig,
    session: AsyncSession = Depends(db_session)
):
    db_config = await session.get(ScraperConfig, config_id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Config nie istnieje")
    for k, v in config.dict(exclude_unset=True).items():
        setattr(db_config, k, v)
    session.add(db_config)
    await session.commit()
    await session.refresh(db_config)
    return db_config

@router.delete("/scraper-configs/{config_id}")
async def delete_scraper_config(
    config_id: int,
    session: AsyncSession = Depends(db_session)
):
    db_config = await session.get(ScraperConfig, config_id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Config nie istnieje")
    await session.delete(db_config)
    await session.commit()
    return {"ok": True}

@router.get("/post-types")
async def get_post_types():
    """
    Zwraca dostępne typy postów.
    """
    return [t.value for t in PostType]

@router.post("/favorite/{post_id}")
async def add_favorite(
    post_id: int,
    user_id: int,
    session: AsyncSession = Depends(db_session)
):
    fav = FavoritePost(user_id=user_id, post_id=post_id)
    session.add(fav)
    await session.commit()
    return {"ok": True}

@router.delete("/favorite/{post_id}")
async def remove_favorite(
    post_id: int,
    user_id: int,
    session: AsyncSession = Depends(db_session)
):
    result = await session.exec(
        select(FavoritePost).where(FavoritePost.user_id == user_id, FavoritePost.post_id == post_id)
    )
    fav = result.first()
    if fav:
        await session.delete(fav)
        await session.commit()
    return {"ok": True}

@router.get("/favorites/{user_id}", response_model=List[Post])
async def get_favorites(
    user_id: int,
    session: AsyncSession = Depends(db_session)
):
    result = await session.exec(
        select(Post).join(FavoritePost, FavoritePost.post_id == Post.id).where(FavoritePost.user_id == user_id)
    )
    return result.all()

@router.get('/scraper-configs/all', tags=['scraper-configs'])
async def get_all_scraper_configs(
    session: AsyncSession = Depends(db_session)
):
    '''
    Zwraca wszystkie konfiguracje scraperow wraz z info o platformie i tworcy
    '''
    result = await session.exec(
        select(ScraperConfig, Platform, Creator)
        .join(Platform, Platform.id == ScraperConfig.platform_id)
        .join(Creator, Creator.id == Platform.creator_id)
    )
    
    configs = []
    for config, platform, creator in result:
        config_dict = config.model_dump()
        config_dict['platform_name'] = platform.name
        config_dict['platform_type'] = platform.platform_type
        config_dict['creator_name'] = creator.name
        configs.append(config_dict)
    
    return configs

