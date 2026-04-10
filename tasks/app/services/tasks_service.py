from app.api.deps import db_session
from app.services.tasks_crud import fetch_task_by_id
from app.models.Tasks import Task
from app.services.vault_crud import add_points_vault, subtract_points_vault
from app.services.experience_transaction_crud import create_experience_transaction, delete_last_experience_transaction
from app.services.streaks_service import add_occurance, remove_occurance

async def task_done (session: db_session, task_id: int, user_id: int):

    db_task: Task = await fetch_task_by_id(session, task_id)

    if db_task.recurrence == None:
        db_task.is_archived = True

    await add_points_vault(session, user_id, db_task.currency_reward, db_task.xp_reward)

    if db_task.category != None:
        transaction = {
            "category_id": db_task.category_id,
            "task_name": db_task.name,
            "amount": db_task.xp_reward}
        await create_experience_transaction(session, transaction, user_id)

    if db_task.streaks != None:
        for streak in db_task.streaks:
            await add_occurance(session, streak.id, user_id)

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    return db_task

async def task_undone(session: db_session, task_id: int, user_id: int):

    db_task: Task = await fetch_task_by_id(session, task_id)

    if db_task.recurrence == None:
        db_task.is_archived = False

    await subtract_points_vault(session, user_id, db_task.currency_reward, db_task.xp_reward)

    if db_task.category != None:
        await delete_last_experience_transaction(session, db_task.name, user_id)

    if db_task.streaks != None:
        for streak in db_task.streaks:
            await remove_occurance(session, streak.id, user_id)

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    return db_task