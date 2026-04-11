from app.api.deps import db_session
from app.models.Platforms import Platform, PlatformCreate, PlatformUpdate
from app.models.Creators import Creator
from sqlmodel import select
from app.core.exceptions.exceptions import PlatformNotFoundException
from typing import Optional


async def create_platform(session: db_session, platform_in: PlatformCreate, creator_id: int):
    db_platform = Platform(**platform_in.model_dump(), creator_id=creator_id)
    session.add(db_platform)
    await session.commit()
    await session.refresh(db_platform)
    return db_platform


async def fetch_platform_by_id(session: db_session, platform_id: int, user_id: int):
    # Platform nie ma owner_id, musimy dołączyć Creatora
    result = await session.exec(
        select(Platform).join(Creator).where(Platform.id == platform_id, Creator.user_id == user_id)
    )
    platform = result.one_or_none()
    if not platform:
        raise PlatformNotFoundException()
    return platform


async def fetch_user_platforms(session: db_session, user_id: int):
    result = await session.exec(select(Platform).join(Creator).where(Creator.user_id == user_id))
    platforms = result.all()
    return platforms


async def update_platform(
    session: db_session, platform_update: PlatformUpdate, platform_id: int, user_id: int
):
    result = await session.exec(
        select(Platform).join(Creator).where(
            Platform.id == platform_id, Creator.user_id == user_id
        )
    )
    db_platform = result.one_or_none()
    if not db_platform:
        raise PlatformNotFoundException()

    update_data = platform_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_platform, key, value)

    session.add(db_platform)
    await session.commit()
    await session.refresh(db_platform)
    return db_platform


async def delete_platform(session: db_session, platform_id: int, user_id: int):
    result = await session.exec(
        select(Platform).join(Creator).where(
            Platform.id == platform_id, Creator.user_id == user_id
        )
    )
    db_platform = result.one_or_none()
    if not db_platform:
        raise PlatformNotFoundException()

    await session.delete(db_platform)
    await session.commit()
    return None


async def move_platform(
    session: db_session,
    platform_id: int,
    new_parent_platform_id: Optional[int],
    user_id: int,
):
    """Przenosi notatkę do innego platformu."""
    db_platform = await fetch_platform_by_id(session, platform_id, user_id)
    db_platform.parent_id = new_parent_platform_id
    session.add(db_platform)
    await session.commit()
    await session.refresh(db_platform)
    return db_platform