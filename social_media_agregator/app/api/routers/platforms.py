from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Platforms import PlatformRead, PlatformCreate, PlatformUpdate
from app.services.platforms_crud import (
    create_platform, fetch_platform_by_id, fetch_user_platforms, update_platform, delete_platform
)
from typing import List

router = APIRouter(prefix="/platforms", tags=["platforms"])

@router.post("", response_model=PlatformRead, status_code=201)
async def post_platform(session: db_session, user: current_active_user, platform: PlatformCreate):
    return await create_platform(session, platform, user.id)

@router.get("", response_model=List[PlatformRead])
async def get_platform(session: db_session, user: current_active_user):
    return await fetch_user_platforms(session, user.id)

@router.get("/{platform_id}", response_model=PlatformRead)
async def get_platform_by_id(session: db_session, user: current_active_user, platform_id: int):
    return await fetch_platform_by_id(session, platform_id, user.id)

@router.patch("/{platform_id}", response_model=PlatformRead)
async def patch_platform(session: db_session, user: current_active_user, platform_id: int, update: PlatformUpdate):
    return await update_platform(session, update, platform_id, user.id)

@router.delete("/{platform_id}", status_code=204)
async def remove_platform(session: db_session, user: current_active_user, platform_id: int):
    return await delete_platform(session, platform_id, user.id)