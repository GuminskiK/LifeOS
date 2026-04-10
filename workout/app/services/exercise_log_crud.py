from app.api.deps import db_session
from app.models.ExerciseLog import ExerciseLog, ExerciseLogCreate, ExerciseLogUpdate
from app.models.WorkoutSession import WorkoutSession
from sqlmodel import select
from app.core.exceptions.exceptions import ExerciseLogNotFoundException

async def create_exercise_log(session: db_session, exerciselog: ExerciseLogCreate, user_id: int):
    
    db_exercise_log = ExerciseLog(**exerciselog.model_dump())
    session.add(db_exercise_log)
    await session.commit()
    await session.refresh(db_exercise_log)

    return db_exercise_log


async def fetch_exercise_log_by_id(session: db_session, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).join(WorkoutSession).where(ExerciseLog.id == exerciselog_id, WorkoutSession.owner_id == owner_id))
    exerciselog = result.one_or_none()

    if not exerciselog:
        raise ExerciseLogNotFoundException()

    return exerciselog


async def fetch_user_exercise_log(session: db_session, owner_id: int):

    result = await session.exec(select(ExerciseLog).join(WorkoutSession).where(WorkoutSession.owner_id == owner_id))
    exerciselog = result.all()

    if not exerciselog:
        raise ExerciseLogNotFoundException()

    return exerciselog

async def update_exercise_log(session: db_session, exerciselog_update: ExerciseLogUpdate, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).join(WorkoutSession).where(ExerciseLog.id == exerciselog_id, WorkoutSession.owner_id == owner_id))
    db_exercise_log = result.one_or_none()

    if not db_exercise_log:
        raise ExerciseLogNotFoundException()

    update_data = exerciselog_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_exercise_log, key, value)

    session.add(db_exercise_log)
    await session.commit()
    await session.refresh(db_exercise_log)

    return db_exercise_log


async def delete_exercise_log(session: db_session, exerciselog_id: int, owner_id: int):

    result = await session.exec(select(ExerciseLog).join(WorkoutSession).where(ExerciseLog.id == exerciselog_id, WorkoutSession.owner_id == owner_id))
    db_exercise_log = result.one_or_none()

    if not db_exercise_log:
        raise ExerciseLogNotFoundException()

    await session.delete(db_exercise_log)
    await session.commit()

    return None
