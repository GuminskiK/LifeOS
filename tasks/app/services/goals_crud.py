from app.api.deps import db_session
from app.models.Goals import Goals
from sqlmodel import select
from app.core.exceptions.exceptions import GoalsNotFoundException

async def create_goal(session: db_session, goal_in: dict, owner_id: int):
    db_goal = Goals(**goal_in, owner_id=owner_id)
    session.add(db_goal)
    await session.commit()
    await session.refresh(db_goal)
    return db_goal

async def fetch_goal_by_id(session: db_session, goal_id: int, owner_id: int):
    result = await session.exec(select(Goals).where(Goals.id == goal_id, Goals.owner_id == owner_id))
    goal = result.one_or_none()
    if not goal:
        raise GoalsNotFoundException()
    return goal

async def fetch_user_goals(session: db_session, owner_id: int):
    result = await session.exec(select(Goals).where(Goals.owner_id == owner_id))
    goals = result.all()
    return goals

async def update_goal(session: db_session, goal_update: dict, goal_id: int, owner_id: int):
    result = await session.exec(select(Goals).where(Goals.id == goal_id, Goals.owner_id == owner_id))
    db_goal = result.one_or_none()
    if not db_goal:
        raise GoalsNotFoundException()

    for key, value in goal_update.items():
        setattr(db_goal, key, value)

    session.add(db_goal)
    await session.commit()
    await session.refresh(db_goal)
    return db_goal

async def delete_goal(session: db_session, goal_id: int, owner_id: int):
    result = await session.exec(select(Goals).where(Goals.id == goal_id, Goals.owner_id == owner_id))
    db_goal = result.one_or_none()
    if not db_goal:
        raise GoalsNotFoundException()

    await session.delete(db_goal)
    await session.commit()
    return None
