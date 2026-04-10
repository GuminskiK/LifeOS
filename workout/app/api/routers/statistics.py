from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.services.statistics_service import (
   get_exercise_progression, get_workout_history_summary, get_user_total_stats
)
from typing import List, Dict, Any

router = APIRouter(prefix="/statistics", tags=["statistics"])

@router.get("/exercise-progression/{exercise_id}", response_model=List[Dict[str, Any]], status_code=200)
async def get_exercise_progression_endpoint(session: db_session, exercise_id: int, owner: current_active_user):
    return await  get_exercise_progression(session, exercise_id, owner.id)

@router.get("/workout-history-summary", response_model=List[Dict[str, Any]], status_code=200)
async def get_workout_history_summary_endpoint(session: db_session, owner: current_active_user, limit: int):
    return await  get_workout_history_summary(session, owner.id, limit)

@router.get("/user-total-stats", response_model=List[Dict[str, Any]], status_code=200)
async def get_user_total_stats_endpoint(session: db_session, owner: current_active_user):
    return await  get_user_total_stats(session, owner.id)