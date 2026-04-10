from app.api.deps import db_session
from app.services.streaks_crud import fetch_streak_by_id
from app.models.Streak import Streak
from app.models.DateType import DateType
from app.services.goal_service import goal_update, goal_downgrade
from datetime import datetime, timezone, timedelta # type: ignore

def is_streak_broken(streak: Streak) -> bool:
    now = datetime.now(timezone.utc)
    # Prosta logika: jeśli minęło więcej niż 2 jednostki czasu (np. 2 dni dla DAY), streak przepada
    delta = now - streak.last_length_update.replace(tzinfo=timezone.utc)
    
    if streak.length_type == DateType.DAY and delta.days >= 2:
        return True
    if streak.length_type == DateType.WEEK and delta.days >= 14:
        return True
    if streak.length_type == DateType.MONTH and delta.days >= 60:
        return True
    return False

async def add_occurance(session: db_session, streak_id: int, owner_id: int):

    db_streak: Streak = await fetch_streak_by_id(session, streak_id, owner_id)

    # Sprawdzenie wygasania
    if is_streak_broken(db_streak):
        db_streak.length = 0
        db_streak.counter = 0
        db_streak.last_length_update = datetime.now(timezone.utc)

    db_streak.counter += 1

    if db_streak.occurance_per_length == db_streak.counter:
        db_streak.length += 1
        db_streak.counter = 0
        db_streak.last_length_update = datetime.now(timezone.utc)

        # Aktualizacja PR (Personal Record)
        if db_streak.length > db_streak.max_length:
            db_streak.max_length = db_streak.length

        if db_streak.goals:
            for goal in db_streak.goals:
                # `goal` is the model, or is it the id? The models for Goal probably return objects.
                # In Tasks it says: goal.id
                await goal_update(session, goal.id, owner_id, db_streak.length)
    
    session.add(db_streak)
    await session.commit()
    await session.refresh(db_streak)

    return db_streak

async def remove_occurance(session: db_session, streak_id: int, owner_id: int):
    
    db_streak: Streak = await fetch_streak_by_id(session, streak_id, owner_id)

    if db_streak.counter == 0:
        if db_streak.length > 0:
            db_streak.length -= 1
            db_streak.counter = db_streak.occurance_per_length - 1
            
            if db_streak.goals:
                for goal in db_streak.goals:
                    await goal_downgrade(session, goal.id, owner_id, db_streak.length)
    else:
        db_streak.counter -= 1
        
    session.add(db_streak)
    await session.commit()
    await session.refresh(db_streak)

    return db_streak