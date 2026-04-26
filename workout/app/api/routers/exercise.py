from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Exercise import ExerciseRead, ExerciseCreate, ExerciseUpdate
from app.services.exercise_crud import (
    create_exercise, fetch_exercise_by_id, fetch_user_exercises, update_exercise, delete_exercise
)
from typing import List

router = APIRouter(prefix="/exercise", tags=["exercise"])

@router.post("", response_model=ExerciseRead, status_code=201)
async def post_exercise(session: db_session, user: current_active_user, exercise: ExerciseCreate):
    return await create_exercise(session, exercise, user.id)

@router.get("", response_model=List[ExerciseRead])
async def get_exercises(session: db_session, user: current_active_user):
    return await fetch_user_exercises(session, user.id)

@router.get("/{exercise_id}", response_model=ExerciseRead)
async def get_exercise_by_id(session: db_session, user: current_active_user, exercise_id: int):
    return await fetch_exercise_by_id(session, exercise_id, user.id)

@router.patch("/{exercise_id}", response_model=ExerciseRead)
async def patch_exercise(session: db_session, user: current_active_user, exercise_id: int, update: ExerciseUpdate):
    return await update_exercise(session, update, exercise_id, user.id)

@router.delete("/{exercise_id}", status_code=204)
async def remove_exercise(session: db_session, user: current_active_user, exercise_id: int):
    return await delete_exercise(session, exercise_id, user.id)