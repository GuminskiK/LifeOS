from app.api.deps import db_session
from app.models.ExerciseLog import ExerciseLog
from app.models.WorkoutSession import WorkoutSession, WorkoutSessionStatus
from app.models.Workout import Workout
from sqlmodel import select, func, desc
from typing import List, Dict, Any

async def get_exercise_progression(session: db_session, exercise_id: int, owner_id: int) -> List[Dict[str, Any]]:
    """
    Pobiera historię postępów dla konkretnego ćwiczenia.
    Zwraca dane idealne pod wykres: data, max ciężar, całkowita objętość (reps * weight).
    """
    statement = (
        select(
            func.date(WorkoutSession.start_time).label("date"),
            func.max(ExerciseLog.actual_weight).label("max_weight"),
            func.sum(ExerciseLog.actual_reps * func.coalesce(ExerciseLog.actual_weight, 1)).label("volume"),
            func.sum(ExerciseLog.actual_reps).label("total_reps")
        )
        .join(WorkoutSession, ExerciseLog.session_id == WorkoutSession.id)
        .where(
            ExerciseLog.exercise_id == exercise_id,
            WorkoutSession.owner_id == owner_id,
            WorkoutSession.status == WorkoutSessionStatus.COMPLETED
        )
        .group_by(func.date(WorkoutSession.start_time))
        .order_by(func.date(WorkoutSession.start_time))
    )
    
    results = await session.exec(statement)
    
    progression = []
    for row in results.all():
        progression.append({
            "date": row.date,
            "max_weight": row.max_weight,
            "volume": row.volume,
            "total_reps": row.total_reps
        })
    
    return progression

async def get_workout_history_summary(session: db_session, owner_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Zwraca listę ostatnich sesji treningowych wraz z nazwą treningu i czasem trwania.
    """
    statement = (
        select(WorkoutSession, Workout.name)
        .join(Workout, WorkoutSession.workout_id == Workout.id)
        .where(WorkoutSession.owner_id == owner_id)
        .order_by(desc(WorkoutSession.start_time))
        .limit(limit)
    )
    
    results = await session.exec(statement)
    
    history = []
    for db_session_record, workout_name in results.all():
        duration = None
        if db_session_record.end_time:
            duration = (db_session_record.end_time - db_session_record.start_time).total_seconds()
            
        history.append({
            "session_id": db_session_record.id,
            "workout_name": workout_name,
            "status": db_session_record.status,
            "date": db_session_record.start_time,
            "duration_seconds": duration
        })
        
    return history

async def get_user_total_stats(session: db_session, owner_id: int):
    """Ogólne statystyki użytkownika: suma treningów, całkowity czas."""
    statement = select(
        func.count(WorkoutSession.id).label("total_count"),
        func.sum(func.extract('epoch', WorkoutSession.end_time - WorkoutSession.start_time)).label("total_seconds")
    ).where(WorkoutSession.owner_id == owner_id, WorkoutSession.status == WorkoutSessionStatus.COMPLETED)
    
    result = await session.exec(statement)
    return result.one_or_none()