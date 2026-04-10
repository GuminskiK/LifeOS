from app.api.deps import db_session
from app.models.Streak import Streak, StreakUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import StreakNotFoundException

async def create_streak(session: db_session, streak_in: dict, owner_id: int):
    db_streak = Streak(**streak_in, owner_id=owner_id)
    session.add(db_streak)
    await session.commit()
    await session.refresh(db_streak)
    return db_streak

async def fetch_streak_by_id(session: db_session, streak_id: int, owner_id: int):
    result = await session.exec(select(Streak).where(Streak.id == streak_id, Streak.owner_id == owner_id))
    streak = result.one_or_none()
    if not streak:
        raise StreakNotFoundException()
    return streak

async def fetch_user_streaks(session: db_session, owner_id: int):
    result = await session.exec(select(Streak).where(Streak.owner_id == owner_id))
    streaks = result.all()
    return streaks

async def update_streak(session: db_session, streak_update: StreakUpdate, streak_id: int, owner_id: int):
    result = await session.exec(select(Streak).where(Streak.id == streak_id, Streak.owner_id == owner_id))
    db_streak = result.one_or_none()
    if not db_streak:
        raise StreakNotFoundException()

    update_data = streak_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_streak, key, value)

    session.add(db_streak)
    await session.commit()
    await session.refresh(db_streak)
    return db_streak

async def delete_streak(session: db_session, streak_id: int, owner_id: int):
    result = await session.exec(select(Streak).where(Streak.id == streak_id, Streak.owner_id == owner_id))
    db_streak = result.one_or_none()
    if not db_streak:
        raise StreakNotFoundException()

    await session.delete(db_streak)
    await session.commit()
    return None
