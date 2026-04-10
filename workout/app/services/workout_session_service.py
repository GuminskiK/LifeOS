import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from app.api.deps import db_session
from app.core.exceptions.exceptions import BadRequestException # Zakładam istnienie
from app.models.WorkoutSession import WorkoutSessionStatus, WorkoutSessionCreate
from app.models.ExerciseLog import ExerciseLogCreate
from app.services import workout_crud, workout_session_crud, exercise_log_crud, progression_service

class WorkoutSessionService:
    @staticmethod
    def _get_redis_key(session_id: int) -> str:
        return f"workout:live_session:{session_id}"

    async def start_session(self, session: db_session, workout_id: int, owner_id: int, redis_client) -> Dict[str, Any]:
        """Inicjalizuje sesję w DB i kopiuje plan do Redisa dla szybkiego dostępu."""
        # 1. Pobierz plan treningu
        workout = await workout_crud.fetch_workout_by_id(session, workout_id, owner_id)
        
        # 2. Utwórz sesję w bazie (Postgres)
        session_create = WorkoutSessionCreate(
            workout_id=workout_id,
            owner_id=owner_id,
            status=WorkoutSessionStatus.ACTIVE
        )
        db_session_record = await workout_session_crud.create_workout_session(session, session_create, owner_id)
        
        # 3. Przygotuj stan dla Redisa
        steps = []
        for step in workout.steps:
            steps.append({
                "step_id": step.id,
                "exercise_id": step.exercise_id,
                "type": step.type.value,
                "goal_type": step.goal_type.value,
                "goal_value": step.goal_value,
                "actual_value": None
            })
            
        state = {
            "session_id": db_session_record.id,
            "workout_name": workout.name,
            "status": db_session_record.status.value,
            "owner_id": owner_id,
            "current_step_index": 0,
            "steps": steps,
            "start_time": db_session_record.start_time.isoformat()
        }
        
        # 4. Zapisz w Redisie (np. z 24h czasem wygaśnięcia)
        await redis_client.set(
            self._get_redis_key(db_session_record.id), 
            json.dumps(state), 
            ex=86400
        )
        
        return state

    async def get_state(self, session_id: int, owner_id: int, redis_client) -> Optional[Dict[str, Any]]:
        data = await redis_client.get(self._get_redis_key(session_id))
        if not data:
            return None
        state = json.loads(data)
        if state.get("owner_id") != owner_id:
            return None
        return state

    async def pause_session(self, session: db_session, session_id: int, owner_id: int, redis_client) -> Optional[Dict[str, Any]]:
        """Zmienia status sesji na PAUSED."""
        state = await self.get_state(session_id, owner_id, redis_client)
        if not state:
            return None

        state["status"] = WorkoutSessionStatus.PAUSED.value
        await redis_client.set(self._get_redis_key(session_id), json.dumps(state))
        
        # Opcjonalnie aktualizujemy DB
        db_ws = await workout_session_crud.fetch_workout_session_by_id(session, session_id, owner_id)
        db_ws.status = WorkoutSessionStatus.PAUSED
        session.add(db_ws)
        await session.commit()
        return state

    async def resume_session(self, session: db_session, session_id: int, owner_id: int, redis_client) -> Optional[Dict[str, Any]]:
        """Zmienia status sesji na ACTIVE."""
        state = await self.get_state(session_id, owner_id, redis_client)
        if not state: 
            return None

        state["status"] = WorkoutSessionStatus.ACTIVE.value
        await redis_client.set(self._get_redis_key(session_id), json.dumps(state))
        
        db_ws = await workout_session_crud.fetch_workout_session_by_id(session, session_id, owner_id)
        db_ws.status = WorkoutSessionStatus.ACTIVE
        session.add(db_ws)
        await session.commit()
        return state

    async def adjust_live_session(self, session_id: int, owner_id: int, adjustment: int, redis_client) -> Optional[Dict[str, Any]]:
        """Modyfikuje cel aktualnego kroku (np. +10s przerwy lub +2 powtórzenia)."""
        state = await self.get_state(session_id, owner_id, redis_client)
        if not state:
            return None
            
        idx = state["current_step_index"]
        state["steps"][idx]["goal_value"] += adjustment
            
        await redis_client.set(self._get_redis_key(session_id), json.dumps(state))
        return state

    async def next_step(self, session_id: int, owner_id: int, actual_performance: int, redis_client) -> Optional[Dict[str, Any]]:
        """Przechodzi do kolejnego kroku i zapisuje wynik obecnego w stanie Redisa."""
        state = await self.get_state(session_id, owner_id, redis_client)
        if not state:
            return None
            
        idx = state["current_step_index"]
        state["steps"][idx]["actual_value"] = actual_performance
        
        if idx + 1 < len(state["steps"]):
            state["current_step_index"] += 1
        else:
            state["status"] = "finished"
            
        await redis_client.set(self._get_redis_key(session_id), json.dumps(state))
        return state

    async def finish_session(self, session: db_session, session_id: int, owner_id: int, redis_client):
        """Kończy sesję, przenosi wyniki z Redisa do Postgresa i uruchamia progresję."""
        state = await self.get_state(session_id, owner_id, redis_client)
        if not state:
            raise BadRequestException("Nie znaleziono aktywnej sesji w cache.")
            
        # 1. Aktualizuj sesję w DB
        db_ws = await workout_session_crud.fetch_workout_session_by_id(session, session_id, owner_id)
        if db_ws.status == WorkoutSessionStatus.COMPLETED:
             raise BadRequestException("Sesja jest już zakończona.")

        db_ws.end_time = datetime.now(timezone.utc)
        db_ws.status = WorkoutSessionStatus.COMPLETED
        session.add(db_ws)
        
        # 2. Zapisz ExerciseLogi (tylko dla typów EXERCISE)
        for step in state["steps"]:
            if step["type"] == "exercise":
                log_data = ExerciseLogCreate(
                    session_id=session_id,
                    workout_step_id=step["step_id"],
                    exercise_id=step["exercise_id"],
                    actual_reps=step["actual_value"] if step["goal_type"] == "reps" else None,
                    actual_time=step["actual_value"] if step["goal_type"] == "time" else None
                )
                await exercise_log_crud.create_exercise_log(session, log_data, owner_id)
        
        await session.commit()
        
        # 3. Uruchom system progresji
        await progression_service.apply_progression_rules(session, session_id, owner_id)
        
        # 4. Posprzątaj Redisa
        await redis_client.delete(self._get_redis_key(session_id))
        
        return db_ws