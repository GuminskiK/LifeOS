from fastapi import APIRouter, status
from typing import List
from app.api.deps import db_session, current_active_user
from app.services import flash_card_crud
from app.models.FlashCard import FlashCardRead, FlashCardCreate, FlashCardUpdate

router = APIRouter()

@router.post("/", response_model=FlashCardRead, status_code=status.HTTP_201_CREATED)
async def create_flash_card(
    item_in: FlashCardCreate, session: db_session, owner: current_active_user
):
    return await flash_card_crud.create_flash_card(session, item_in, owner.id)

@router.get("/", response_model=List[FlashCardRead])
async def list_flash_cards(session: db_session, owner: current_active_user):
    return await flash_card_crud.fetch_user_flash_cards(session, owner.id)

@router.get("/{item_id}", response_model=FlashCardRead)
async def get_flash_card(item_id: int, session: db_session, owner: current_active_user):
    return await flash_card_crud.fetch_flash_card_by_id(session, item_id, owner.id)

@router.patch("/{item_id}", response_model=FlashCardRead)
async def update_flash_card(
    item_id: int,
    item_update: FlashCardUpdate,
    session: db_session,
    owner: current_active_user,
):
    return await flash_card_crud.update_flash_card(session, item_update, item_id, owner.id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flash_card(item_id: int, session: db_session, owner: current_active_user):
    await flash_card_crud.delete_flash_card(session, item_id, owner.id)
    return None
