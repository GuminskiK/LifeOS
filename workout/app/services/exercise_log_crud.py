from app.api.deps import db_session
from app.models.ExerciseLog import ExerciseLog, ExerciseLogCreate, ExerciseLogUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import ExerciseLogNotFoundException

async def create_exerciselog(session: db_session, exerciselog: ExerciseLogCreate, user_id: int):
    
    db_exerciselog = ExerciseLog(**exerciselog.model_dump(), owner_id=user_id)
    session.add(db_exerciselog)
    await session.commit()
    await session.refresh(db_exerciselog)

    return db_exerciselog


async def fetch_exerciselog_by_id(session: db_session, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).where(ExerciseLog.id == exerciselog_id, ExerciseLog.owner_id == owner_id))
    exerciselog = result.one_or_none()

    if not exerciselog:
        raise ExerciseLogNotFoundException()

    return exerciselog


async def fetch_user_categories(session: db_session, owner_id: int):

    result = await session.exec(select(ExerciseLog).where(ExerciseLog.owner_id == owner_id))
    exerciselog = result.all()

    if not exerciselog:
        raise ExerciseLogNotFoundException()

    return exerciselog

async def update_exerciselog(session: db_session, exerciselog_update: ExerciseLogUpdate, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).where(ExerciseLog.id == exerciselog_id, ExerciseLog.owner_id == owner_id))
    db_exerciselog = result.one_or_none()

    if not db_exerciselog:
        raise ExerciseLogNotFoundException()

    update_data = exerciselog_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_exerciselog, key, value)

    session.add(db_exerciselog)
    await session.commit()
    await session.refresh(db_exerciselog)

    return db_exerciselog


async def delete_exerciselog(session: db_session, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).where(ExerciseLog.id == exerciselog_id, ExerciseLog.owner_id == owner_id))
    db_exerciselog = result.one_or_none()

    if not db_exerciselog:
        raise ExerciseLogNotFoundException()

    await session.delete(db_exerciselog)
    await session.commit()

    return None
