from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.WorkoutStep import WorkoutStepRead, WorkoutStepCreate, WorkoutStepUpdate
from app.services.workout_step_crud import (
    create_workout_step, fetch_workout_step_by_id, fetch_user_workout_step, update_workout_step, delete_workout_step
)
from typing import List

router = APIRouter(prefix="/workout_step", tags=["workout_step"])

@router.post("", response_model=WorkoutStepRead, status_code=201)
async def post_workout_step(session: db_session, user: current_active_user, workout_step: WorkoutStepCreate):
    return await create_workout_step(session, workout_step, user.id)

@router.get("", response_model=List[WorkoutStepRead])
async def get_workout_step(session: db_session, user: current_active_user):
    return await fetch_user_workout_step(session, user.id)

@router.get("/{workout_step_id}", response_model=WorkoutStepRead)
async def get_workout_step(session: db_session, user: current_active_user, workout_step_id: int):
    return await fetch_workout_step_by_id(session, workout_step_id, user.id)

@router.patch("/{workout_step_id}", response_model=WorkoutStepRead)
async def patch_workout_step(session: db_session, user: current_active_user, workout_step_id: int, update: WorkoutStepUpdate):
    return await update_workout_step(session, update, workout_step_id, user.id)

@router.delete("/{workout_step_id}", status_code=204)
async def remove_workout_step(session: db_session, user: current_active_user, workout_step_id: int):
    return await delete_workout_step(session, workout_step_id, user.id)