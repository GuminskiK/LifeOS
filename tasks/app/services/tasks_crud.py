from app.api.deps import db_session
from app.models.Tasks import Task, TaskUpdate, TaskCreate
from sqlmodel import select
from app.core.exceptions.exceptions import TaskNotFoundException

async def create_task(session: db_session, task_in: TaskCreate, owner_id: int):
    db_task = Task(**task_in.model_dump(), owner_id=owner_id)
    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)
    return db_task

async def fetch_task_by_id(session: db_session, task_id: int, owner_id: int):
    result = await session.exec(select(Task).where(Task.id == task_id, Task.owner_id == owner_id))
    task = result.one_or_none()
    if not task:
        raise TaskNotFoundException()
    return task

async def fetch_user_tasks(session: db_session, owner_id: int):
    result = await session.exec(select(Task).where(Task.owner_id == owner_id))
    tasks = result.all()
    return tasks

async def update_task(session: db_session, task_update: TaskUpdate, task_id: int, owner_id: int):
    result = await session.exec(select(Task).where(Task.id == task_id, Task.owner_id == owner_id))
    db_task = result.one_or_none()
    if not db_task:
        raise TaskNotFoundException()

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)
    return db_task

async def remove_task(session: db_session, task_id: int, owner_id: int, delete_subtasks: bool = False):
    result = await session.exec(select(Task).where(Task.id == task_id, Task.owner_id == owner_id))
    db_task = result.one_or_none()
    if not db_task:
        raise TaskNotFoundException()

    if delete_subtasks:
        for sub in db_task.sub_tasks:
            await session.delete(sub)

    await session.delete(db_task)
    await session.commit()
    return None
