from app.api.deps import db_session
from app.models.WorkoutSession import WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import WorkoutSessionNotFoundException

async def create_workout_session(session: db_session, workout_session: WorkoutSessionCreate, user_id: int):
    
    db_workout_session = WorkoutSession(**workout_session.model_dump(), owner_id=user_id)
    session.add(db_workout_session)
    await session.commit()
    await session.refresh(db_workout_session)

    return db_workout_session


async def fetch_workout_session_by_id(session: db_session, workout_session_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workout_session_id, WorkoutSession.owner_id == owner_id))
    workout_session = result.one_or_none()

    if not workout_session:
        raise WorkoutSessionNotFoundException()

    return workout_session


async def fetch_user_categories(session: db_session, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.owner_id == owner_id))
    workout_session = result.all()

    if not workout_session:
        raise WorkoutSessionNotFoundException()

    return workout_session

async def update_workout_session(session: db_session, workout_session_update: WorkoutSessionUpdate, workout_session_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workout_session_id, WorkoutSession.owner_id == owner_id))
    db_workout_session = result.one_or_none()

    if not db_workout_session:
        raise WorkoutSessionNotFoundException()

    update_data = workout_session_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_workout_session, key, value)

    session.add(db_workout_session)
    await session.commit()
    await session.refresh(db_workout_session)

    return db_workout_session


async def delete_workout_session(session: db_session, workout_session_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workout_session_id, WorkoutSession.owner_id == owner_id))
    db_workout_session = result.one_or_none()

    if not db_workout_session:
        raise WorkoutSessionNotFoundException()

    await session.delete(db_workout_session)
    await session.commit()

    return None
