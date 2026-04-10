from app.api.deps import db_session
from app.models.WorkoutSession import WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import WorkoutSessionNotFoundException

async def create_workoutsession(session: db_session, workoutsession: WorkoutSessionCreate, user_id: int):
    
    db_workoutsession = WorkoutSession(**workoutsession.model_dump(), owner_id=user_id)
    session.add(db_workoutsession)
    await session.commit()
    await session.refresh(db_workoutsession)

    return db_workoutsession


async def fetch_workoutsession_by_id(session: db_session, workoutsession_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workoutsession_id, WorkoutSession.owner_id == owner_id))
    workoutsession = result.one_or_none()

    if not workoutsession:
        raise WorkoutSessionNotFoundException()

    return workoutsession


async def fetch_user_categories(session: db_session, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.owner_id == owner_id))
    workoutsession = result.all()

    if not workoutsession:
        raise WorkoutSessionNotFoundException()

    return workoutsession

async def update_workoutsession(session: db_session, workoutsession_update: WorkoutSessionUpdate, workoutsession_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workoutsession_id, WorkoutSession.owner_id == owner_id))
    db_workoutsession = result.one_or_none()

    if not db_workoutsession:
        raise WorkoutSessionNotFoundException()

    update_data = workoutsession_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_workoutsession, key, value)

    session.add(db_workoutsession)
    await session.commit()
    await session.refresh(db_workoutsession)

    return db_workoutsession


async def delete_workoutsession(session: db_session, workoutsession_id: int, owner_id: int):

    result = await session.exec(select(WorkoutSession).where(WorkoutSession.id == workoutsession_id, WorkoutSession.owner_id == owner_id))
    db_workoutsession = result.one_or_none()

    if not db_workoutsession:
        raise WorkoutSessionNotFoundException()

    await session.delete(db_workoutsession)
    await session.commit()

    return None
