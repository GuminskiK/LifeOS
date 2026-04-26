from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Workout import WorkoutRead, WorkoutCreate, WorkoutUpdate
from app.services.workout_crud import (
    create_workout, fetch_workout_by_id, fetch_user_workouts, update_workout, delete_workout
)
from typing import List

router = APIRouter(prefix="/workout", tags=["workout"])

@router.post("", response_model=WorkoutRead, status_code=201)
async def post_workout(session: db_session, user: current_active_user, workout: WorkoutCreate):
    return await create_workout(session, workout, user.id)

@router.get("", response_model=List[WorkoutRead])
async def get_workouts(session: db_session, user: current_active_user):
    return await fetch_user_workouts(session, user.id)

@router.get("/{workout_id}", response_model=WorkoutRead)
async def get_workout_by_id(session: db_session, user: current_active_user, workout_id: int):
    return await fetch_workout_by_id(session, workout_id, user.id)

@router.patch("/{workout_id}", response_model=WorkoutRead)
async def patch_workout(session: db_session, user: current_active_user, workout_id: int, update: WorkoutUpdate):
    return await update_workout(session, update, workout_id, user.id)

@router.delete("/{workout_id}", status_code=204)
async def remove_workout(session: db_session, user: current_active_user, workout_id: int):
    return await delete_workout(session, workout_id, user.id)