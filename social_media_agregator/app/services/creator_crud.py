from app.api.deps import db_session
from app.models.Creators import Creator, CreatorCreate, CreatorUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import CreatorNotFoundException
from typing import Optional


async def create_creator(session: db_session, creator_in: CreatorCreate, user_id: int):
    db_creator = Creator(**creator_in.model_dump(), user_id=user_id)
    session.add(db_creator)
    await session.commit()
    await session.refresh(db_creator)
    return db_creator


async def fetch_creator_by_id(session: db_session, creator_id: int, owner_id: int):
    result = await session.exec(
        select(Creator).where(Creator.id == creator_id, Creator.owner_id == owner_id)
    )
    creator = result.one_or_none()
    if not creator:
        raise CreatorNotFoundException()
    return creator


async def fetch_user_creators(session: db_session, owner_id: int):
    result = await session.exec(select(Creator).where(Creator.owner_id == owner_id))
    creators = result.all()
    return creators


async def update_creator(
    session: db_session, creator_update: CreatorUpdate, creator_id: int, owner_id: int
):
    result = await session.exec(
        select(Creator).where(Creator.id == creator_id, Creator.owner_id == owner_id)
    )
    db_creator = result.one_or_none()
    if not db_creator:
        raise CreatorNotFoundException()

    update_data = creator_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_creator, key, value)

    session.add(db_creator)
    await session.commit()
    await session.refresh(db_creator)
    return db_creator


async def delete_creator(session: db_session, creator_id: int, owner_id: int):
    result = await session.exec(
        select(Creator).where(Creator.id == creator_id, Creator.owner_id == owner_id)
    )
    db_creator = result.one_or_none()
    if not db_creator:
        raise CreatorNotFoundException()

    await session.delete(db_creator)
    await session.commit()
    return None


async def move_creator(
    session: db_session,
    creator_id: int,
    new_parent_creator_id: Optional[int],
    owner_id: int,
):
    """Przenosi notatkę do innego creatoru."""
    db_creator = await fetch_creator_by_id(session, creator_id, owner_id)
    db_creator.parent_id = new_parent_creator_id
    session.add(db_creator)
    await session.commit()
    await session.refresh(db_creator)
    return db_creator