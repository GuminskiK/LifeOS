from app.api.deps import db_session
from app.models.Folder import Folder, FolderCreate, FolderUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import FolderNotFoundException
from typing import Optional

async def create_folder(session: db_session, folder_in: FolderCreate, owner_id: int):
    db_folder = Folder(**folder_in.model_dump(), owner_id=owner_id)
    session.add(db_folder)
    await session.commit()
    await session.refresh(db_folder)
    return db_folder

async def fetch_folder_by_id(session: db_session, folder_id: int, owner_id: int):
    result = await session.exec(select(Folder).where(Folder.id == folder_id, Folder.owner_id == owner_id))
    folder = result.one_or_none()
    if not folder:
        raise FolderNotFoundException()
    return folder

async def fetch_user_folders(session: db_session, owner_id: int):
    result = await session.exec(select(Folder).where(Folder.owner_id == owner_id))
    folders = result.all()
    return folders

async def update_folder(session: db_session, folder_update: FolderUpdate, folder_id: int, owner_id: int):
    result = await session.exec(select(Folder).where(Folder.id == folder_id, Folder.owner_id == owner_id))
    db_folder = result.one_or_none()
    if not db_folder:
        raise FolderNotFoundException()

    update_data = folder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_folder, key, value)

    session.add(db_folder)
    await session.commit()
    await session.refresh(db_folder)
    return db_folder

async def delete_folder(session: db_session, folder_id: int, owner_id: int):
    result = await session.exec(select(Folder).where(Folder.id == folder_id, Folder.owner_id == owner_id))
    db_folder = result.one_or_none()
    if not db_folder:
        raise FolderNotFoundException()

    await session.delete(db_folder)
    await session.commit()
    return None

async def move_folder(session: db_session, folder_id: int, new_parent_folder_id: Optional[int], owner_id: int):
    """Przenosi notatkę do innego folderu."""
    db_folder = await fetch_folder_by_id(session, folder_id, owner_id)
    db_folder.parent_id = new_parent_folder_id
    session.add(db_folder)
    await session.commit()
    await session.refresh(db_folder)
    return db_folder
