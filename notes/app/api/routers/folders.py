from fastapi import APIRouter, status
from app.api.deps import db_session, current_active_user
from app.models.Folder import FolderRead, FolderCreate, FolderUpdate
from app.services import folder_crud
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=FolderRead, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: FolderCreate,
    session: db_session,
    owner: current_active_user
):
    return await folder_crud.create_folder(session, folder_in, owner.id)

@router.get("/", response_model=List[FolderRead])
async def list_folders(
    session: db_session,
    owner: current_active_user
):
    return await folder_crud.fetch_user_folders(session, owner.id)

@router.get("/{folder_id}", response_model=FolderRead)
async def get_folder(
    folder_id: int,
    session: db_session,
    owner: current_active_user
):
    return await folder_crud.fetch_folder_by_id(session, folder_id, owner.id)

@router.patch("/{folder_id}", response_model=FolderRead)
async def update_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    session: db_session,
    owner: current_active_user
):
    return await folder_crud.update_folder(session, folder_update, folder_id, owner.id)

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    session: db_session,
    owner: current_active_user
):
    await folder_crud.delete_folder(session, folder_id, owner.id)
    return None

@router.post("/{folder_id}/move", response_model=FolderRead)
async def move_folder(
    folder_id: int, 
    session: db_session,
    owner: current_active_user,
    new_parent_folder_id: Optional[int] = None,
    
    
):
    return await folder_crud.move_folder(session, folder_id, new_parent_folder_id, owner.id)