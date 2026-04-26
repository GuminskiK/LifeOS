from app.api.deps import db_session
from app.models.WorkoutStep import WorkoutStep, WorkoutStepCreate, WorkoutStepUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import WorkoutStepNotFoundException

async def create_workout_step(session: db_session, workoutstep: WorkoutStepCreate, user_id: int):
    
    db_workoutstep = WorkoutStep(**workoutstep.model_dump())
    session.add(db_workoutstep)
    await session.commit()
    await session.refresh(db_workoutstep)

    return db_workoutstep


async def fetch_workout_step_by_id(session: db_session, workoutstep_id: int, owner_id: int):

    result = await session.exec(select(WorkoutStep).where(WorkoutStep.id == workoutstep_id, WorkoutStep.owner_id == owner_id))
    workoutstep = result.one_or_none()

    if not workoutstep:
        raise WorkoutStepNotFoundException()

    return workoutstep


async def fetch_user_workout_steps(session: db_session, owner_id: int):

    result = await session.exec(select(WorkoutStep).where(WorkoutStep.owner_id == owner_id))
    workoutstep = result.all()

    if not workoutstep:
        raise WorkoutStepNotFoundException()

    return workoutstep

async def update_workout_step(session: db_session, workoutstep_update: WorkoutStepUpdate, workoutstep_id: int, owner_id: int):

    result = await session.exec(select(WorkoutStep).where(WorkoutStep.id == workoutstep_id, WorkoutStep.owner_id == owner_id))
    db_workoutstep = result.one_or_none()

    if not db_workoutstep:
        raise WorkoutStepNotFoundException()

    update_data = workoutstep_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_workoutstep, key, value)

    session.add(db_workoutstep)
    await session.commit()
    await session.refresh(db_workoutstep)

    return db_workoutstep


async def delete_workout_step(session: db_session, workoutstep_id: int, owner_id: int):

    result = await session.exec(select(WorkoutStep).where(WorkoutStep.id == workoutstep_id, WorkoutStep.owner_id == owner_id))
    db_workoutstep = result.one_or_none()

    if not db_workoutstep:
        raise WorkoutStepNotFoundException()

    await session.delete(db_workoutstep)
    await session.commit()

    return None
