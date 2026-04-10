from app.api.deps import db_session
from app.services.tasks_crud import fetch_task_by_id, fetch_user_tasks
from app.models.Tasks import Task
from app.services.vault_crud import add_points_vault, subtract_points_vault
from app.services.experience_transaction_crud import create_experience_transaction, delete_last_experience_transaction
from app.models.ExperienceTransaction import ExperienceTransactionCreate
from app.services.streaks_service import add_occurance, remove_occurance
from dateutil.rrule import rrulestr
from datetime import datetime, timezone
from typing import List, Dict, Any

async def get_task_forecast(session: db_session, user_id: int, start: datetime, end: datetime) -> List[Dict[str, Any]]:
    tasks = await fetch_user_tasks(session, user_id)
    forecast = []

    for task in tasks:
        if task.recurrence and not task.is_archived:
            try:
                dtstart = task.start_date.replace(tzinfo=None) if task.start_date else None
                rule = rrulestr(task.recurrence, dtstart=dtstart)
                # rrule działa na naiwnych datach, konwertujemy
                occurrences = rule.between(start.replace(tzinfo=None), end.replace(tzinfo=None))
                
                for occ in occurrences:
                    forecast.append({
                        "id": task.id,
                        "name": task.name,
                        "start_date": occ,
                        "type": task.type,
                        "is_virtual": True
                    })
            except Exception:
                continue
    return forecast

async def sync_habits(session: db_session, user_id: int):
    """Resetuje streaki dla habitów, które nie zostały wykonane w terminie."""
    tasks = await fetch_user_tasks(session, user_id)
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    for task in tasks:
        if task.type.value == "habit" and task.recurrence and task.start_date:
            dtstart = task.start_date.replace(tzinfo=None) if task.start_date.tzinfo else task.start_date
            rule = rrulestr(task.recurrence, dtstart=dtstart)
            # Sprawdzamy czy od start_date do teraz powinno wystąpić kolejne zadanie
            next_expected = rule.after(task.start_date.replace(tzinfo=None) if task.start_date.tzinfo else task.start_date) # type: ignore
            
            if next_expected and now > next_expected:
                # Użytkownik przegapił termin -> resetujemy streaki
                if task.streaks:
                    for streak in task.streaks:
                        streak.length = 0
                        streak.counter = 0
                        streak.last_length_update = now
                        session.add(streak)
                
                # Przesuwamy datę zadania na najbliższą przyszłą
                task.start_date = rule.after(now.replace(tzinfo=None)) # type: ignore
                session.add(task)
    
    await session.commit()

async def task_done (session: db_session, task_id: int, user_id: int):

    db_task: Task = await fetch_task_by_id(session, task_id, user_id)

    if not db_task.recurrence:
        db_task.is_archived = True
    else:
        # Logika rekurencji (używając dateutil.rrule)
        try: # type: ignore
            dtstart = db_task.start_date.replace(tzinfo=None) if db_task.start_date and db_task.start_date.tzinfo else db_task.start_date
            rule = rrulestr(db_task.recurrence, dtstart=dtstart)
            next_date = rule.after(datetime.now(timezone.utc).replace(tzinfo=None))
            if next_date and db_task.start_date:
                diff = next_date - db_task.start_date
                db_task.start_date = next_date
                if db_task.end_date:
                    db_task.end_date = db_task.end_date + diff
        except Exception:
            # Jeśli rrule jest nieprawidłowy, po prostu archiwizujemy
            db_task.is_archived = True

    await add_points_vault(session, user_id, db_task.currency_reward, db_task.xp_reward)

    if db_task.category:
        transaction_in = ExperienceTransactionCreate(
            category_id=db_task.category_id,
            task_name=db_task.name,
            amount=db_task.xp_reward
        )
        await create_experience_transaction(session, transaction_in, user_id)

    if db_task.streaks:
        for streak in db_task.streaks:
            await add_occurance(session, streak.id, user_id)

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    return db_task

async def task_undone(session: db_session, task_id: int, user_id: int):

    db_task: Task = await fetch_task_by_id(session, task_id, user_id)

    if not db_task.recurrence:
        db_task.is_archived = False

    await subtract_points_vault(session, user_id, db_task.currency_reward, db_task.xp_reward)

    if db_task.category:
        await delete_last_experience_transaction(session, db_task.name, user_id)

    if db_task.streaks:
        for streak in db_task.streaks:
            await remove_occurance(session, streak.id, user_id)

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    return db_task