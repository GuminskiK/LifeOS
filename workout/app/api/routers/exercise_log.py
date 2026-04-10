from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.ExerciseLog import ExerciseLogRead, ExerciseLogCreate, ExerciseLogUpdate
from app.services.exercise_log_crud import (
    create_exercise_log, fetch_exercise_log_by_id, fetch_user_exercise_log, update_exercise_log, delete_exercise_log
)
from typing import List

router = APIRouter(prefix="/exercise", tags=["exercise"])

@router.post("", response_model=ExerciseLogRead, status_code=201)
async def post_goal(session: db_session, user: current_active_user, exercise: ExerciseLogCreate):
    return await create_exercise_log(session, exercise, user.id)

@router.get("", response_model=List[ExerciseLogRead])
async def get_exercise(session: db_session, user: current_active_user):
    return await fetch_user_exercise_log(session, user.id)

@router.get("/{exercise_log_id}", response_model=ExerciseLogRead)
async def get_goal(session: db_session, user: current_active_user, exercise_log_id: int):
    return await fetch_exercise_log_by_id(session, exercise_log_id, user.id)

@router.patch("/{exercise_log_id}", response_model=ExerciseLogRead)
async def patch_goal(session: db_session, user: current_active_user, exercise_log_id: int, update: ExerciseLogUpdate):
    return await update_exercise_log(session, update, exercise_log_id, user.id)

@router.delete("/{exercise_log_id}", status_code=204)
async def remove_goal(session: db_session, user: current_active_user, exercise_log_id: int):
    return await delete_exercise_log(session, exercise_log_id, user.id)