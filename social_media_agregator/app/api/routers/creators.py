from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Creators import CreatorRead, CreatorCreate, CreatorUpdate
from app.services.creator_crud import (
    create_creator, fetch_creator_by_id, fetch_user_creators, update_creator, delete_creator
)
from typing import List

router = APIRouter(prefix="/creators", tags=["creators"])

@router.post("", response_model=CreatorRead, status_code=201)
async def post_creator(session: db_session, user: current_active_user, creator: CreatorCreate):
    return await create_creator(session, creator, user.id)

@router.get("", response_model=List[CreatorRead])
async def get_creator(session: db_session, user: current_active_user):
    return await fetch_creator_by_id(session, user.id)

@router.get("/{creator_id}", response_model=CreatorRead)
async def get_creator_by_id(session: db_session, user: current_active_user, creator_id: int):
    return await fetch_user_creators(session, creator_id, user.id)

@router.patch("/{creator_id}", response_model=CreatorRead)
async def patch_creator(session: db_session, user: current_active_user, creator_id: int, update: CreatorUpdate):
    return await update_creator(session, update, creator_id, user.id)

@router.delete("/{creator_id}", status_code=204)
async def remove_creator(session: db_session, user: current_active_user, creator_id: int):
    return await delete_creator(session, creator_id, user.id)