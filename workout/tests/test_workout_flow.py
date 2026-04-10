import pytest
from app.services.workout_session_service import WorkoutSessionService
from app.services import exercise_crud, workout_crud, workout_step_crud, exercise_log_crud
from app.models.Exercise import ExerciseCreate, StepType, GoalType
from app.models.Workout import WorkoutCreate
from app.models.WorkoutStep import WorkoutStepCreate, WorkoutStep
from app.models.WorkoutSession import WorkoutSessionStatus
from sqlmodel import select

@pytest.mark.asyncio
async def test_full_workout_cycle_integration(db_session, redis_test, test_user_id):
    service = WorkoutSessionService()
    
    # 1. Przygotowanie danych (Katalog -> Plan)
    ex_in = ExerciseCreate(name="Pompki", owner_id=test_user_id)
    exercise = await exercise_crud.create_exercise(db_session, ex_in, test_user_id)
    
    wrk_in = WorkoutCreate(name="FBW A", owner_id=test_user_id)
    workout = await workout_crud.create_workout(db_session, wrk_in, test_user_id)
    
    # Krok z regresją liniową: startujemy od 10 powtórzeń, inkrementacja o 2
    step_in = WorkoutStepCreate(
        workout_id=workout.id,
        exercise_id=exercise.id,
        order_index=0,
        type=StepType.EXERCISE,
        goal_type=GoalType.REPS,
        goal_value=10,
        progression_config={"type": "linear", "increment": 2, "max_value": 20}
    )
    step = await workout_step_crud.create_workoutstep(db_session, step_in, test_user_id)
    await db_session.commit()
    
    # 2. START SESJI (Kopiowanie do Redisa)
    state = await service.start_session(db_session, workout.id, test_user_id, redis_test)
    session_id = state["session_id"]
    
    assert state["status"] == WorkoutSessionStatus.ACTIVE.value
    assert state["steps"][0]["goal_value"] == 10
    
    # 3. ADJUST (Użytkownik czuje się silny, dodaje 5 powtórzeń do celu w trakcie treningu)
    # Zmiana następuje tylko w Redisie, DB pozostaje nietknięte
    adjusted_state = await service.adjust_live_session(session_id, test_user_id, 5, redis_test)
    assert adjusted_state["steps"][0]["goal_value"] == 15
    
    # 4. NEXT STEP (Wykonanie ćwiczenia)
    # Użytkownik raportuje 15 powtórzeń
    state_after_next = await service.next_step(session_id, test_user_id, 15, redis_test)
    assert state_after_next["status"] == "finished" # Ostatni krok
    
    # 5. FINISH SESSION (Zrzut z Redisa do Postgresa + Progresja)
    db_ws = await service.finish_session(db_session, session_id, test_user_id, redis_test)
    
    # Sprawdzenie czy sesja w DB jest zakończona
    assert db_ws.status == WorkoutSessionStatus.COMPLETED
    assert db_ws.end_time is not None
    
    # 6. WERYFIKACJA LOGÓW
    # Czy zapisał się log z wykonaniem 15 powtórzeń?
    logs = await exercise_log_crud.fetch_user_exercise_log(db_session, test_user_id)
    assert len(logs) == 1
    assert logs[0].actual_reps == 15
    assert logs[0].session_id == session_id
    
    # 7. WERYFIKACJA SYSTEMU PROGRESJI
    # Cel w DB wynosił 10. Wykonano 15. Reguła liniowa +2.
    # Nowy cel w szablonie (WorkoutStep) powinien wynosić 12 (10 + 2).
    # Uwaga: System progresji aktualizuje szablon na podstawie oryginalnego celu z DB.
    await db_session.refresh(step)
    assert step.goal_value == 12
    
    # 8. CZYSTOŚĆ
    # Sprawdzenie czy klucz w Redisie został usunięty
    redis_data = await redis_test.get(f"workout:live_session:{session_id}")
    assert redis_data is None