from app.api.deps import db_session
from app.models.Workout import Workout, WorkoutCreate, WorkoutUpdate
from app.models.WorkoutStep import WorkoutStep
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.core.exceptions.exceptions import WorkoutNotFoundException

async def create_workout(session: db_session, workout: WorkoutCreate, user_id: int):
    
    db_workout = Workout(**workout.model_dump(), owner_id=user_id)
    session.add(db_workout)
    await session.commit()
    await session.refresh(db_workout)

    return db_workout


async def fetch_workout_by_id(session: db_session, workout_id: int, owner_id: int):

    result = await session.exec(
        select(Workout)
        .options(selectinload(Workout.steps))
        .options(selectinload(WorkoutStep.exercise))
        .where(Workout.id == workout_id, Workout.owner_id == owner_id))
    workout = result.one_or_none()

    if not workout:
        raise WorkoutNotFoundException()

    return workout


async def fetch_user_workouts(session: db_session, owner_id: int):

    result = await session.exec(
        select(Workout)
        .options(selectinload(Workout.steps))
        .where(Workout.owner_id == owner_id)
    )
    workouts = result.all()

    return workouts

async def update_workout(session: db_session, workout_update: WorkoutUpdate, workout_id: int, owner_id: int):

    result = await session.exec(select(Workout).where(Workout.id == workout_id, Workout.owner_id == owner_id))
    db_workout = result.one_or_none()

    if not db_workout:
        raise WorkoutNotFoundException()

    update_data = workout_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_workout, key, value)

    session.add(db_workout)
    await session.commit()
    await session.refresh(db_workout)

    return db_workout


async def delete_workout(session: db_session, workout_id: int, owner_id: int):

    result = await session.exec(select(Workout).where(Workout.id == workout_id, Workout.owner_id == owner_id))
    db_workout = result.one_or_none()

    if not db_workout:
        raise WorkoutNotFoundException()

    await session.delete(db_workout)
    await session.commit()

    return None
