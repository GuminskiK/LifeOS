from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Streak import StreakRead, StreakCreate, StreakUpdate
from app.services.streaks_crud import (
    create_streak, fetch_streak_by_id, fetch_user_streaks, update_streak, delete_streak
)
from typing import List

router = APIRouter(prefix="/streaks", tags=["streaks"])

@router.post("", response_model=StreakRead, status_code=201)
async def post_streak(session: db_session, user: current_active_user, streak: StreakCreate):
    return await create_streak(session, streak.model_dump(), user.id)

@router.get("", response_model=List[StreakRead])
async def get_streaks(session: db_session, user: current_active_user):
    return await fetch_user_streaks(session, user.id)

@router.get("/{streak_id}", response_model=StreakRead)
async def get_streak(session: db_session, user: current_active_user, streak_id: int):
    return await fetch_streak_by_id(session, streak_id, user.id)

@router.patch("/{streak_id}", response_model=StreakRead)
async def patch_streak(session: db_session, user: current_active_user, streak_id: int, update: StreakUpdate):
    return await update_streak(session, update, streak_id, user.id)

@router.delete("/{streak_id}", status_code=204)
async def remove_streak(session: db_session, user: current_active_user, streak_id: int):
    return await delete_streak(session, streak_id, user.id)