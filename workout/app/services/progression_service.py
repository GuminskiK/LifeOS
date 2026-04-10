from app.api.deps import db_session
from app.models.WorkoutStep import WorkoutStep
from app.models.ExerciseLog import ExerciseLog
from sqlmodel import select
from typing import List

async def apply_progression_rules(session: db_session, session_id: int, owner_id: int):
    """
    Analizuje logi z zakończonej sesji i aktualizuje Szablon Treningu (WorkoutSteps)
    na podstawie zdefiniowanych reguł progression_config.
    """
    # 1. Pobieramy logi z tej konkretnej sesji
    statement = select(ExerciseLog).where(ExerciseLog.session_id == session_id)
    results = await session.exec(statement)
    logs: List[ExerciseLog] = results.all()

    for log in logs:
        # 2. Pobieramy odpowiadający mu krok z planu (szablonu)
        step_statement = select(WorkoutStep).where(WorkoutStep.id == log.workout_step_id)
        step_result = await session.exec(step_statement)
        step = step_result.one_or_none()

        if not step or not step.progression_config:
            continue

        config = step.progression_config
        # Zakładamy strukturę: {"type": "linear", "increment": 2, "max_value": 20, "on_max_reach": {...}}

        if config.get("type") == "linear":
            is_goal_met = False
            
            # Sprawdzamy czy cel został osiągnięty
            if step.goal_type.value == "reps":
                if log.actual_reps and log.actual_reps >= step.goal_value:
                    is_goal_met = True
            elif step.goal_type.value == "time":
                if log.actual_time and log.actual_time >= step.goal_value:
                    is_goal_met = True

            if is_goal_met:
                increment = config.get("increment", 1)
                max_val = config.get("max_value")

                # Sprawdzamy czy osiągnęliśmy sufit dla tego ćwiczenia
                if max_val and (step.goal_value + increment) > max_val:
                    # Logika "awansu" na inne ćwiczenie
                    on_max = config.get("on_max_reach", {})
                    next_exercise_id = on_max.get("next_exercise_id")
                    if next_exercise_id:
                        step.exercise_id = next_exercise_id
                        step.goal_value = on_max.get("reset_goal", 5)
                else:
                    # Po prostu zwiększamy trudność o inkrement
                    step.goal_value += increment
                
                session.add(step)

    await session.commit()