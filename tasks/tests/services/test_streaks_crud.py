import pytest
from app.services import streaks_crud
from app.models.Streak import StreakCreate, StreakUpdate
from app.models.DateType import DateType
from app.core.exceptions.exceptions import StreakNotFoundException
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_create_streak_success(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    assert streak.id is not None
    assert streak.length == 0
    assert streak.owner_id == test_user_id

@pytest.mark.asyncio
async def test_fetch_streak_by_id_success(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    fetched_streak = await streaks_crud.fetch_streak_by_id(db_sess, created_streak.id, test_user_id)
    assert fetched_streak.id == created_streak.id
    assert fetched_streak.length_type == created_streak.length_type

@pytest.mark.asyncio
async def test_fetch_streak_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(StreakNotFoundException):
        await streaks_crud.fetch_streak_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_user_streaks_success(db_sess, test_user_id):
    await streaks_crud.create_streak(db_sess, StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0), test_user_id)
    await streaks_crud.create_streak(db_sess, StreakCreate(length=1, length_type=DateType.WEEK, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0), test_user_id)

    streaks = await streaks_crud.fetch_user_streaks(db_sess, test_user_id)
    assert len(streaks) == 2
    assert all(s.owner_id == test_user_id for s in streaks)

@pytest.mark.asyncio
async def test_fetch_user_streaks_no_streaks(db_sess, test_user_id):
    streaks = await streaks_crud.fetch_user_streaks(db_sess, test_user_id)
    assert len(streaks) == 0

@pytest.mark.asyncio
async def test_update_streak_success(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    update_in = StreakUpdate(length=5, counter=1)
    updated_streak = await streaks_crud.update_streak(db_sess, update_in, created_streak.id, test_user_id)

    assert updated_streak.length == 5
    assert updated_streak.counter == 1

@pytest.mark.asyncio
async def test_update_streak_not_found(db_sess, test_user_id):
    update_in = StreakUpdate(length=5)
    with pytest.raises(StreakNotFoundException):
        await streaks_crud.update_streak(db_sess, update_in, 999, test_user_id)

@pytest.mark.asyncio
async def test_delete_streak_success(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    await streaks_crud.delete_streak(db_sess, created_streak.id, test_user_id)

    with pytest.raises(StreakNotFoundException):
        await streaks_crud.fetch_streak_by_id(db_sess, created_streak.id, test_user_id)

@pytest.mark.asyncio
async def test_delete_streak_not_found(db_sess, test_user_id):
    with pytest.raises(StreakNotFoundException):
        await streaks_crud.delete_streak(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_streak_by_id_other_user(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    with pytest.raises(StreakNotFoundException):
        await streaks_crud.fetch_streak_by_id(db_sess, created_streak.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_update_streak_other_user(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    update_in = StreakUpdate(length=5)
    with pytest.raises(StreakNotFoundException):
        await streaks_crud.update_streak(db_sess, update_in, created_streak.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_delete_streak_other_user(db_sess, test_user_id):
    streak_in = StreakCreate(length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0)
    created_streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    with pytest.raises(StreakNotFoundException):
        await streaks_crud.delete_streak(db_sess, created_streak.id, test_user_id + 1)