from app.api.deps import db_session
from app.services.streaks_crud import fetch_streak_by_id
from app.models.Streak import Streak
from app.services.goal_service import goal_update, goal_downgrade
async def add_occurance(session: db_session, streak_id: int, owner_id: int):

    db_streak: Streak = await fetch_streak_by_id(session, streak_id, owner_id)

    db_streak.counter += 1

    if db_streak.occurance_per_length == db_streak.counter:
        db_streak.length += 1
        db_streak.counter = 0

        if db_streak.goals != None:
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
            
            if db_streak.goals != None:
                for goal in db_streak.goals:
                    await goal_downgrade(session, goal.id, owner_id, db_streak.length)
    else:
        db_streak.counter -= 1
        
    session.add(db_streak)
    await session.commit()
    await session.refresh(db_streak)

    return db_streak