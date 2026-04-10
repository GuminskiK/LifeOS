from app.api.deps import db_session
from app.models.Exercise import Exercise, ExerciseCreate, ExerciseUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import ExerciseNotFoundException

async def create_exercise(session: db_session, exercise: ExerciseCreate, user_id: int):
    
    db_exercise = Exercise(**exercise.model_dump(), owner_id=user_id)
    session.add(db_exercise)
    await session.commit()
    await session.refresh(db_exercise)

    return db_exercise


async def fetch_exercise_by_id(session: db_session, exercise_id: int, owner_id: int):

    result = await session.exec(select(Exercise).where(Exercise.id == exercise_id, Exercise.owner_id == owner_id))
    exercise = result.one_or_none()

    if not exercise:
        raise ExerciseNotFoundException()

    return exercise


async def fetch_user_categories(session: db_session, owner_id: int):

    result = await session.exec(select(Exercise).where(Exercise.owner_id == owner_id))
    exercise = result.all()

    if not exercise:
        raise ExerciseNotFoundException()

    return exercise

async def update_exercise(session: db_session, exercise_update: ExerciseUpdate, exercise_id: int, owner_id: int):

    result = await session.exec(select(Exercise).where(Exercise.id == exercise_id, Exercise.owner_id == owner_id))
    db_exercise = result.one_or_none()

    if not db_exercise:
        raise ExerciseNotFoundException()

    update_data = exercise_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_exercise, key, value)

    session.add(db_exercise)
    await session.commit()
    await session.refresh(db_exercise)

    return db_exercise


async def delete_exercise(session: db_session, exercise_id: int, owner_id: int):

    result = await session.exec(select(Exercise).where(Exercise.id == exercise_id, Exercise.owner_id == owner_id))
    db_exercise = result.one_or_none()

    if not db_exercise:
        raise ExerciseNotFoundException()

    await session.delete(db_exercise)
    await session.commit()

    return None
