from fastapi import APIRouter, status
from typing import List
from app.api.deps import db_session, current_active_user
from app.services import flash_note_crud
from app.models.FlashNote import FlashNoteRead, FlashNoteCreate, FlashNoteUpdate

router = APIRouter()

@router.post("/", response_model=FlashNoteRead, status_code=status.HTTP_201_CREATED)
async def create_flash_note(
    item_in: FlashNoteCreate, session: db_session, owner: current_active_user
):
    return await flash_note_crud.create_flash_note(session, item_in, owner.id)

@router.get("/", response_model=List[FlashNoteRead])
async def list_flash_notes(session: db_session, owner: current_active_user):
    return await flash_note_crud.fetch_user_flash_notes(session, owner.id)

@router.get("/{item_id}", response_model=FlashNoteRead)
async def get_flash_note(item_id: int, session: db_session, owner: current_active_user):
    return await flash_note_crud.fetch_flash_note_by_id(session, item_id, owner.id)

@router.patch("/{item_id}", response_model=FlashNoteRead)
async def update_flash_note(
    item_id: int,
    item_update: FlashNoteUpdate,
    session: db_session,
    owner: current_active_user,
):
    return await flash_note_crud.update_flash_note(session, item_update, item_id, owner.id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flash_note(item_id: int, session: db_session, owner: current_active_user):
    await flash_note_crud.delete_flash_note(session, item_id, owner.id)
    return None
