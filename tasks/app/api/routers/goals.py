from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Goals import GoalsRead, GoalsCreate, GoalsUpdate
from app.services.goals_crud import (
    create_goal, fetch_goal_by_id, fetch_user_goals, update_goal, delete_goal
)
from typing import List

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("", response_model=GoalsRead, status_code=201)
async def post_goal(session: db_session, user: current_active_user, goal: GoalsCreate):
    return await create_goal(session, goal, user.id)

@router.get("", response_model=List[GoalsRead])
async def get_goals(session: db_session, user: current_active_user):
    return await fetch_user_goals(session, user.id)

@router.get("/{goal_id}", response_model=GoalsRead)
async def get_goal(session: db_session, user: current_active_user, goal_id: int):
    return await fetch_goal_by_id(session, goal_id, user.id)

@router.patch("/{goal_id}", response_model=GoalsRead)
async def patch_goal(session: db_session, user: current_active_user, goal_id: int, update: GoalsUpdate):
    return await update_goal(session, update, goal_id, user.id)

@router.delete("/{goal_id}", status_code=204)
async def remove_goal(session: db_session, user: current_active_user, goal_id: int):
    return await delete_goal(session, goal_id, user.id)