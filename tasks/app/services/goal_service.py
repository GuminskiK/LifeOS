from app.api.deps import db_session
from app.services.goals_crud import fetch_goal_by_id # Import the module directly
from app.services.vault_crud import add_points_vault, subtract_points_vault

async def goal_update(session: db_session, goal_id: int, owner_id: int, length: int):

    db_goal = await fetch_goal_by_id(session, goal_id, owner_id)

    if db_goal.length == length:
        await add_points_vault(session, owner_id, db_goal.reward, 0)
        db_goal.is_archive = True

    session.add(db_goal)
    await session.commit()
    await session.refresh(db_goal)

    return db_goal

async def goal_downgrade(session: db_session, goal_id: int, owner_id: int, length: int):

    db_goal = await fetch_goal_by_id(session, goal_id, owner_id)

    if db_goal.length == length + 1 and db_goal.is_archive:
        await subtract_points_vault(session, owner_id, db_goal.reward, 0)
        db_goal.is_archive = False

    session.add(db_goal)
    await session.commit()
    await session.refresh(db_goal)

    return db_goal
