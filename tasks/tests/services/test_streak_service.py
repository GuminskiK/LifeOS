import pytest
from datetime import datetime, timedelta, timezone
from app.services import streaks_service, streaks_crud, vault_crud
from app.models.Streak import StreakCreate, DateType
from app.models.Goals import GoalsCreate
from app.core.exceptions.exceptions import StreakNotFoundException
from app.services.goals_crud import create_goal, fetch_goal_by_id

@pytest.mark.asyncio
async def test_is_streak_broken_day_type(db_sess):
    # Not broken
    streak_not_broken = StreakCreate(
        length=1, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc) - timedelta(hours=23), counter=1, occurance_per_length=1
    )
    assert not streaks_service.is_streak_broken(streak_not_broken)

    # Broken (2 days passed)
    streak_broken = StreakCreate(
        length=1, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc) - timedelta(days=2, hours=1), counter=1, occurance_per_length=1
    )
    assert streaks_service.is_streak_broken(streak_broken)

@pytest.mark.asyncio
async def test_is_streak_broken_week_type(db_sess):
    # Not broken
    streak_not_broken = StreakCreate(
        length=1, length_type=DateType.WEEK, last_length_update=datetime.now(timezone.utc) - timedelta(days=13), counter=1, occurance_per_length=1
    )
    assert not streaks_service.is_streak_broken(streak_not_broken)

    # Broken (14 days passed)
    streak_broken = StreakCreate(
        length=1, length_type=DateType.WEEK, last_length_update=datetime.now(timezone.utc) - timedelta(days=14, hours=1), counter=1, occurance_per_length=1
    )
    assert streaks_service.is_streak_broken(streak_broken)

@pytest.mark.asyncio
async def test_add_occurance_increment_counter(db_sess, test_user_id):
    streak_in = StreakCreate(
        length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=2, max_length=0
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    updated_streak = await streaks_service.add_occurance(db_sess, streak.id, test_user_id)
    assert updated_streak.counter == 1
    assert updated_streak.length == 0

@pytest.mark.asyncio
async def test_add_occurance_increment_length_and_reset_counter(db_sess, test_user_id):
    streak_in = StreakCreate(
        length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=1, occurance_per_length=2, max_length=0
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    updated_streak = await streaks_service.add_occurance(db_sess, streak.id, test_user_id)
    assert updated_streak.counter == 0
    assert updated_streak.length == 1
    assert updated_streak.max_length == 1
    assert updated_streak.last_length_update.date() == datetime.now(timezone.utc).date()

@pytest.mark.asyncio
async def test_add_occurance_reset_on_broken_streak(db_sess, test_user_id):
    streak_in = StreakCreate(
        length=5, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc) - timedelta(days=3), counter=1, occurance_per_length=1, max_length=5
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    updated_streak = await streaks_service.add_occurance(db_sess, streak.id, test_user_id)
    assert updated_streak.length == 1 # Reset to 0, then incremented to 1
    assert updated_streak.counter == 0
    assert updated_streak.max_length == 5 # Max length should not be affected by reset
    assert updated_streak.last_length_update.date() == datetime.now(timezone.utc).date()

@pytest.mark.asyncio
async def test_add_occurance_not_found(db_sess, test_user_id):
    with pytest.raises(StreakNotFoundException):
        await streaks_service.add_occurance(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_remove_occurance_decrement_counter(db_sess, test_user_id):
    streak_in = StreakCreate(
        length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=1, occurance_per_length=2, max_length=0
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    updated_streak = await streaks_service.remove_occurance(db_sess, streak.id, test_user_id)
    assert updated_streak.counter == 0
    assert updated_streak.length == 0

@pytest.mark.asyncio
async def test_remove_occurance_decrement_length_and_reset_counter(db_sess, test_user_id):
    streak_in = StreakCreate(
        length=1, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=2, max_length=1
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)

    updated_streak = await streaks_service.remove_occurance(db_sess, streak.id, test_user_id)
    assert updated_streak.counter == 1 # occurance_per_length - 1
    assert updated_streak.length == 0

@pytest.mark.asyncio
async def test_remove_occurance_not_found(db_sess, test_user_id):
    with pytest.raises(StreakNotFoundException):
        await streaks_service.remove_occurance(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_add_occurance_updates_goal(db_sess, test_user_id):
    # Create a goal
    goal_in = GoalsCreate(length=1, reward=100, is_archive=False)
    goal = await create_goal(db_sess, goal_in, test_user_id)

    # Create a streak linked to the goal
    streak_in = StreakCreate(
        length=0, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=0
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)
    goal.streak_id = streak.id
    db_sess.add(goal)
    await db_sess.commit()

    # Add occurrence to streak, which should trigger goal_update
    await streaks_service.add_occurance(db_sess, streak.id, test_user_id)
    # We need to fetch the goal again to get the updated state
    updated_goal = await fetch_goal_by_id(db_sess, goal.id, test_user_id)
    assert updated_goal.is_archive is True # Goal should be archived
    # Check vault for reward, assuming goal_update adds it
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 100

@pytest.mark.asyncio
async def test_remove_occurance_downgrades_goal(db_sess, test_user_id):
    # Create a goal that is already achieved and archived
    goal_in = GoalsCreate(length=1, reward=100, is_archive=True)
    goal = await create_goal(db_sess, goal_in, test_user_id)
    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0) # Add reward to vault

    # Create a streak linked to the goal, with length 1 (achieved)
    streak_in = StreakCreate(
        length=1, length_type=DateType.DAY, last_length_update=datetime.now(timezone.utc), counter=0, occurance_per_length=1, max_length=1
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)
    goal.streak_id = streak.id
    db_sess.add(goal)
    await db_sess.commit()

    # Remove occurrence from streak, which should trigger goal_downgrade
    await streaks_service.remove_occurance(db_sess, streak.id, test_user_id)
    # We need to fetch the goal again to get the updated state
    updated_goal = await fetch_goal_by_id(db_sess, goal.id, test_user_id)
    assert updated_goal.is_archive is False
    
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 0