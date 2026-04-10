import pytest
from datetime import datetime, timedelta, timezone
from app.services import categories_service, categories_crud, experience_transaction_crud
from app.models.Categories import CategoryCreate
from app.models.ExperienceTransaction import ExperienceTransactionCreate
from app.models.DateType import DateType

@pytest.mark.asyncio
async def test_get_stats_day_batch_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    # Create some experience transactions
    now = datetime.now(timezone.utc)
    await experience_transaction_crud.create_experience_transaction(
        db_sess,
        ExperienceTransactionCreate(category_id=category.id, task_name="Task 1", amount=10),
        test_user_id # This transaction will have 'now' timestamp
    )
    await experience_transaction_crud.create_experience_transaction(
        db_sess,
        ExperienceTransactionCreate(category_id=category.id, task_name="Task 2", amount=20),
        test_user_id # This transaction will also have 'now' timestamp
    )
    # Transaction for another day
    yesterday = now - timedelta(days=1)
    await experience_transaction_crud.create_experience_transaction(
        db_sess,
        ExperienceTransactionCreate(
            category_id=category.id, task_name="Task 3", amount=5,
            timestamp=yesterday # Explicitly set timestamp for yesterday
        ),
        test_user_id 
    )

    start_date = yesterday - timedelta(days=1)
    end_date = now + timedelta(days=1)

    stats = await categories_service.get_stats(
        db_sess, test_user_id, start_date, end_date, DateType.DAY, [category.id]
    )

    assert len(stats) >= 2 # At least two days with data
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = yesterday.strftime("%Y-%m-%d")

    found_today = False
    found_yesterday = False
    for stat in stats:
        if stat['date'] == today_str:
            assert stat['earned_xp'] == 30
            found_today = True
        if stat['date'] == yesterday_str:
            assert stat['earned_xp'] == 5
            found_yesterday = True
    
    assert found_today
    assert found_yesterday

@pytest.mark.asyncio
async def test_get_stats_no_transactions(db_sess, test_user_id):
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=7)
    end_date = now + timedelta(days=1)

    stats = await categories_service.get_stats(db_sess, test_user_id, start_date, end_date, DateType.DAY, [])
    assert stats == []