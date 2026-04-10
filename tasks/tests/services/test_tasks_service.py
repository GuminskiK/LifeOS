import pytest
from datetime import datetime, timedelta, timezone
from app.services import tasks_service, tasks_crud, vault_crud, experience_transaction_crud, streaks_crud, categories_crud
from app.models.Tasks import TaskCreate, TaskType
from app.models.Categories import CategoryCreate
from app.models.Streak import StreakCreate, DateType
from app.core.exceptions.exceptions import TaskNotFoundException
from app.models.ExperienceTransaction import ExperienceTransactionCreate

@pytest.mark.asyncio
async def test_get_task_forecast_success(db_sess, test_user_id):
    # Create a recurring task
    task_in = TaskCreate(
        name="Daily Habit",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc) - timedelta(days=1), # Start yesterday, ensure it's timezone aware
        recurrence="FREQ=DAILY;COUNT=5"
    )
    await tasks_crud.create_task(db_sess, task_in, test_user_id)

    start_date = datetime.now(timezone.utc) - timedelta(minutes=1)
    end_date = start_date + timedelta(days=7)

    forecast = await tasks_service.get_task_forecast(db_sess, test_user_id, start_date, end_date)
    
    # The rule is COUNT=5, and start_date is yesterday.
    # So, occurrences are: yesterday, today, tomorrow, day after tomorrow, day after day after tomorrow.
    # The forecast should include occurrences from today onwards within the range.
    assert len(forecast) >= 4 # At least 4 occurrences (today, tomorrow, etc.)
    assert all(item['is_virtual'] for item in forecast)
    assert all(item['name'] == "Daily Habit" for item in forecast)
    assert all(item['start_date'].replace(tzinfo=timezone.utc) >= start_date.replace(tzinfo=timezone.utc) for item in forecast)

@pytest.mark.asyncio
async def test_get_task_forecast_no_recurring_tasks(db_sess, test_user_id):
    task_in = TaskCreate(name="One-time Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    await tasks_crud.create_task(db_sess, task_in, test_user_id)

    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=7)

    forecast = await tasks_service.get_task_forecast(db_sess, test_user_id, start_date, end_date)
    assert len(forecast) == 0

@pytest.mark.asyncio
async def test_sync_habits_resets_streak(db_sess, test_user_id):
    # Create a habit task
    habit_task_in = TaskCreate(
        name="Daily Exercise",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc) - timedelta(days=3), # Task was due 3 days ago, ensure it's timezone aware
        recurrence="FREQ=DAILY"
    )
    habit_task = await tasks_crud.create_task(db_sess, habit_task_in, test_user_id)

    # Create a streak for this habit
    streak_in = StreakCreate(
        length=2, # Current streak length
        length_type=DateType.DAY,
        last_length_update=datetime.now(timezone.utc) - timedelta(days=2), # Last updated 2 days ago
        counter=1,
        occurance_per_length=1,
        max_length=2
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)
    
    # Link task to streak (manual for test setup)
    habit_task = await tasks_crud.fetch_task_by_id(db_sess, habit_task.id, test_user_id)
    habit_task.streaks.append(streak)
    db_sess.add(habit_task)
    await db_sess.commit()
    await db_sess.refresh(habit_task, attribute_names=["streaks"])
    await db_sess.refresh(streak)

    # Sync habits
    await tasks_service.sync_habits(db_sess, test_user_id)

    # Verify streak was reset
    synced_streak = await streaks_crud.fetch_streak_by_id(db_sess, streak.id, test_user_id)
    assert synced_streak.length == 0
    assert synced_streak.counter == 0
    assert synced_streak.last_length_update.date() == datetime.now(timezone.utc).date()

    # Verify task start_date was moved to the future
    synced_task = await tasks_crud.fetch_task_by_id(db_sess, habit_task.id, test_user_id)
    assert synced_task.start_date.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc).replace(tzinfo=timezone.utc) - timedelta(hours=1)

@pytest.mark.asyncio
async def test_sync_habits_no_reset_if_not_overdue(db_sess, test_user_id):
    # Create a habit task that is not overdue
    habit_task_in = TaskCreate(
        name="Daily Exercise",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc) - timedelta(hours=1), # Started recently, ensure it's timezone aware
        recurrence="FREQ=DAILY"
    )
    habit_task = await tasks_crud.create_task(db_sess, habit_task_in, test_user_id)

    # Create a streak for this habit
    streak_in = StreakCreate(
        length=2,
        length_type=DateType.DAY,
        last_length_update=datetime.now(timezone.utc) - timedelta(hours=1),
        counter=1,
        occurance_per_length=1,
        max_length=2
    )
    streak = await streaks_crud.create_streak(db_sess, streak_in, test_user_id)
    habit_task = await tasks_crud.fetch_task_by_id(db_sess, habit_task.id, test_user_id)
    habit_task.streaks.append(streak)
    db_sess.add(habit_task)
    await db_sess.commit()
    await db_sess.refresh(habit_task, attribute_names=["streaks"])
    await db_sess.refresh(streak)

    # Sync habits
    await tasks_service.sync_habits(db_sess, test_user_id)

    # Verify streak was NOT reset
    synced_streak = await streaks_crud.fetch_streak_by_id(db_sess, streak.id, test_user_id)
    assert synced_streak.length == 2
    assert synced_streak.counter == 1

@pytest.mark.asyncio
async def test_task_done_non_recurring_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Test Cat")
    category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    task_in = TaskCreate(
        name="One-time Task",
        type=TaskType.TASK,
        start_date=datetime.now(timezone.utc), # Ensure it's timezone aware
        xp_reward=10,
        currency_reward=5,
        category_id=category.id
    )
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)
    
    # Ensure vault exists
    await vault_crud.get_or_create_vault(db_sess, test_user_id)

    done_task = await tasks_service.task_done(db_sess, task.id, test_user_id)

    assert done_task.is_archived is True
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.xp_total == 10
    assert vault.currency_total == 5
    transactions = await experience_transaction_crud.fetch_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 1
    assert transactions[0].task_name == "One-time Task"

@pytest.mark.asyncio
async def test_task_done_recurring_success(db_sess, test_user_id):
    task_in = TaskCreate(
        name="Recurring Task",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc) - timedelta(days=1), # Ensure it's timezone aware
        recurrence="FREQ=DAILY"
    )
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    original_start_date = task.start_date
    done_task = await tasks_service.task_done(db_sess, task.id, test_user_id)

    assert done_task.is_archived is False
    assert done_task.start_date > original_start_date
    assert done_task.start_date.date() == (datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=1)).date() # This assertion is correct now

@pytest.mark.asyncio
async def test_task_done_invalid_recurrence_archives(db_sess, test_user_id):
    task_in = TaskCreate(
        name="Bad Recurrence",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc), # Ensure it's timezone aware
        recurrence="INVALID_RULE"
    )
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    done_task = await tasks_service.task_done(db_sess, task.id, test_user_id)
    assert done_task.is_archived is True

@pytest.mark.asyncio
async def test_task_done_not_found(db_sess, test_user_id):
    with pytest.raises(TaskNotFoundException):
        await tasks_service.task_done(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_task_undone_non_recurring_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Test Cat")
    category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    task_in = TaskCreate(
        name="One-time Task",
        type=TaskType.TASK,
        start_date=datetime.now(timezone.utc), # Ensure it's timezone aware
        xp_reward=10,
        currency_reward=5,
        category_id=category.id,
        is_archived=True # Start as archived
    )
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)
    
    # Manually add points and transaction to simulate a done task
    await vault_crud.add_points_vault(db_sess, test_user_id, 5, 10)
    await experience_transaction_crud.create_experience_transaction(
        db_sess,
        ExperienceTransactionCreate(category_id=category.id, task_name="One-time Task", amount=10),
        test_user_id
    )

    undone_task = await tasks_service.task_undone(db_sess, task.id, test_user_id)

    assert undone_task.is_archived is False
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.xp_total == 0
    assert vault.currency_total == 0
    transactions = await experience_transaction_crud.fetch_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 0

@pytest.mark.asyncio
async def test_task_undone_not_found(db_sess, test_user_id):
    with pytest.raises(TaskNotFoundException):
        await tasks_service.task_undone(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_task_undone_recurring_no_change_to_archive(db_sess, test_user_id):
    task_in = TaskCreate(
        name="Recurring Task",
        type=TaskType.HABIT,
        start_date=datetime.now(timezone.utc), # Ensure it's timezone aware
        recurrence="FREQ=DAILY",
        is_archived=False
    )
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    undone_task = await tasks_service.task_undone(db_sess, task.id, test_user_id)
    assert undone_task.is_archived is False # Should remain False
