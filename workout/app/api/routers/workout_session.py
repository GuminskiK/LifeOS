from fastapi import APIRouter, Body
from app.api.deps import db_session, current_active_user, redis_client
from app.models.WorkoutSession import WorkoutSessionRead, WorkoutSessionCreate, WorkoutSessionUpdate
from app.services.workout_session_crud import (
    create_workout_session, fetch_workout_session_by_id, fetch_user_workout_session, update_workout_session, delete_workout_session
)
from app.services.workout_session_service import WorkoutSessionService
from typing import List, Dict, Any

router = APIRouter(prefix="/workout_session", tags=["workout_session"])
session_service = WorkoutSessionService()

@router.post("", response_model=WorkoutSessionRead, status_code=201)
async def post_workout_session(session: db_session, user: current_active_user, workout_session: WorkoutSessionCreate):
    return await create_workout_session(session, workout_session, user.id)

@router.post("/start/{workout_id}", response_model=Dict[str, Any])
async def start_workout_session(session: db_session, redis: redis_client, user: current_active_user, workout_id: int):
    """Rozpoczyna nowy trening: tworzy sesję w DB i ładuje plan do Redisa."""
    return await session_service.start_session(session, workout_id, user.id, redis)

@router.get("/{workout_session_id}/live", response_model=Dict[str, Any])
async def get_live_state(workout_session_id: int, redis: redis_client, user: current_active_user):
    """Pobiera aktualny stan treningu z Redisa (timery, cele, postęp)."""
    return await session_service.get_state(workout_session_id, user.id, redis)

@router.post("/{workout_session_id}/pause", response_model=Dict[str, Any])
async def pause_workout_session(session: db_session, redis: redis_client, user: current_active_user, workout_session_id: int):
    """Wstrzymuje trening."""
    return await session_service.pause_session(session, workout_session_id, user.id, redis)

@router.post("/{workout_session_id}/resume", response_model=Dict[str, Any])
async def resume_workout_session(session: db_session, redis: redis_client, user: current_active_user, workout_session_id: int):
    """Wznawia trening."""
    return await session_service.resume_session(session, workout_session_id, user.id, redis)

@router.post("/{workout_session_id}/next", response_model=Dict[str, Any])
async def next_workout_step(workout_session_id: int, redis: redis_client, user: current_active_user, actual_performance: int = Body(..., embed=True)):
    """Zatwierdza obecne ćwiczenie i przechodzi do następnego kroku."""
    return await session_service.next_step(workout_session_id, user.id, actual_performance, redis)

@router.patch("/{workout_session_id}/adjust", response_model=Dict[str, Any])
async def adjust_session(workout_session_id: int, redis: redis_client, user: current_active_user, adjustment: int = Body(..., embed=True)):
    """Dynamiczna zmiana w trakcie (np. dodanie 10s do przerwy)."""
    return await session_service.adjust_live_session(workout_session_id, user.id, adjustment, redis)

@router.post("/{workout_session_id}/finish", response_model=WorkoutSessionRead)
async def finish_workout_session(session: db_session, redis: redis_client, user: current_active_user, workout_session_id: int):
    """Kończy trening, zapisuje logi do Postgresa i przelicza progresję."""
    return await session_service.finish_session(session, workout_session_id, user.id, redis)

@router.get("", response_model=List[WorkoutSessionRead])
async def get_workout_session(session: db_session, user: current_active_user):
    return await fetch_user_workout_session(session, user.id)

@router.get("/{workout_session_id}", response_model=WorkoutSessionRead)
async def get_workout_session_by_id(session: db_session, user: current_active_user, workout_session_id: int):
    return await fetch_workout_session_by_id(session, workout_session_id, user.id)

@router.patch("/{workout_session_id}", response_model=WorkoutSessionRead)
async def patch_workout_session(session: db_session, user: current_active_user, workout_session_id: int, update: WorkoutSessionUpdate):
    return await update_workout_session(session, update, workout_session_id, user.id)

@router.delete("/{workout_session_id}", status_code=204)
async def remove_workout_session(session: db_session, user: current_active_user, workout_session_id: int):
    return await delete_workout_session(session, workout_session_id, user.id)