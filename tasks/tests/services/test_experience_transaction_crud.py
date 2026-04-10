import pytest
from app.services import experience_transaction_crud
from app.models.ExperienceTransaction import ExperienceTransactionCreate
from app.core.exceptions.exceptions import ExperienceTransactionNotFoundException
from sqlmodel import select

@pytest.mark.asyncio
async def test_create_experience_transaction_success(db_sess, test_user_id):
    transaction_in = ExperienceTransactionCreate(category_id=1, task_name="Test Task", amount=50)
    transaction = await experience_transaction_crud.create_experience_transaction(db_sess, transaction_in, test_user_id)

    assert transaction.id is not None
    assert transaction.user_id == test_user_id
    assert transaction.category_id == 1
    assert transaction.task_name == "Test Task"
    assert transaction.amount == 50
    assert transaction.timestamp is not None

@pytest.mark.asyncio
async def test_fetch_transaction_by_id_success(db_sess, test_user_id):
    transaction_in = ExperienceTransactionCreate(category_id=1, task_name="Test Task", amount=50)
    created_transaction = await experience_transaction_crud.create_experience_transaction(db_sess, transaction_in, test_user_id)

    fetched_transaction = await experience_transaction_crud.fetch_transaction_by_id(db_sess, created_transaction.id, test_user_id)
    assert fetched_transaction.id == created_transaction.id
    assert fetched_transaction.user_id == test_user_id

@pytest.mark.asyncio
async def test_fetch_transaction_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(ExperienceTransactionNotFoundException):
        await experience_transaction_crud.fetch_transaction_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_user_transactions_success(db_sess, test_user_id):
    await experience_transaction_crud.create_experience_transaction(db_sess, ExperienceTransactionCreate(category_id=1, task_name="Task 1", amount=10), test_user_id)
    await experience_transaction_crud.create_experience_transaction(db_sess, ExperienceTransactionCreate(category_id=2, task_name="Task 2", amount=20), test_user_id)

    transactions = await experience_transaction_crud.fetch_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 2
    assert all(t.user_id == test_user_id for t in transactions)

@pytest.mark.asyncio
async def test_fetch_user_transactions_no_transactions(db_sess, test_user_id):
    transactions = await experience_transaction_crud.fetch_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 0

@pytest.mark.asyncio
async def test_delete_last_experience_transaction_success(db_sess, test_user_id):
    # Create multiple transactions for the same task name
    await experience_transaction_crud.create_experience_transaction(db_sess, ExperienceTransactionCreate(category_id=1, task_name="Task A", amount=10), test_user_id)
    await experience_transaction_crud.create_experience_transaction(db_sess, ExperienceTransactionCreate(category_id=1, task_name="Task A", amount=20), test_user_id)
    
    # Ensure the second transaction has a later timestamp
    await db_sess.commit()
    result = await db_sess.exec(select(experience_transaction_crud.ExperienceTransaction).where(experience_transaction_crud.ExperienceTransaction.task_name=="Task A").order_by(experience_transaction_crud.ExperienceTransaction.timestamp.desc()))
    latest = result.first()
    if latest:
        await db_sess.refresh(latest)

    deleted = await experience_transaction_crud.delete_last_experience_transaction(db_sess, "Task A", test_user_id)
    assert deleted is True

    transactions = await experience_transaction_crud.fetch_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 1
    assert transactions[0].amount == 10 # The older one should remain

@pytest.mark.asyncio
async def test_delete_last_experience_transaction_not_found(db_sess, test_user_id):
    deleted = await experience_transaction_crud.delete_last_experience_transaction(db_sess, "NonExistent Task", test_user_id)
    assert deleted is False

@pytest.mark.asyncio
async def test_fetch_transaction_by_id_other_user(db_sess, test_user_id):
    transaction_in = ExperienceTransactionCreate(category_id=1, task_name="Test Task", amount=50)
    created_transaction = await experience_transaction_crud.create_experience_transaction(db_sess, transaction_in, test_user_id)

    with pytest.raises(ExperienceTransactionNotFoundException):
        await experience_transaction_crud.fetch_transaction_by_id(db_sess, created_transaction.id, test_user_id + 1)