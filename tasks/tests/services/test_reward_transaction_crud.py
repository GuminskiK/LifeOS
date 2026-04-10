import pytest
from app.services import reward_transaction_crud, rewards_crud
from app.models.Rewards import RewardCreate
from app.core.exceptions.exceptions import RewardTransactionNotFoundException

@pytest.mark.asyncio
async def test_create_reward_transaction_success(db_sess, test_user_id):
    reward_in = RewardCreate(name="Test Reward", description="Desc", price=10, quantity_left=1)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    transaction = await reward_transaction_crud.create_reward_transaction(db_sess, created_reward.id, test_user_id)

    assert transaction.id is not None
    assert transaction.user_id == test_user_id
    assert transaction.reward_id == created_reward.id
    assert transaction.timestamp is not None

@pytest.mark.asyncio
async def test_fetch_reward_transaction_by_id_success(db_sess, test_user_id):
    reward_in = RewardCreate(name="Test Reward", description="Desc", price=10, quantity_left=1)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)
    created_transaction = await reward_transaction_crud.create_reward_transaction(db_sess, created_reward.id, test_user_id)

    fetched_transaction = await reward_transaction_crud.fetch_reward_transaction_by_id(db_sess, created_transaction.id, test_user_id)
    assert fetched_transaction.id == created_transaction.id
    assert fetched_transaction.user_id == test_user_id

@pytest.mark.asyncio
async def test_fetch_reward_transaction_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(RewardTransactionNotFoundException):
        await reward_transaction_crud.fetch_reward_transaction_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_reward_user_transactions_success(db_sess, test_user_id):
    reward_in_1 = RewardCreate(name="Reward 1", description="Desc", price=10, quantity_left=1)
    reward_1 = await rewards_crud.create_reward(db_sess, reward_in_1, test_user_id)
    reward_in_2 = RewardCreate(name="Reward 2", description="Desc", price=20, quantity_left=1)
    reward_2 = await rewards_crud.create_reward(db_sess, reward_in_2, test_user_id)

    await reward_transaction_crud.create_reward_transaction(db_sess, reward_1.id, test_user_id)
    await reward_transaction_crud.create_reward_transaction(db_sess, reward_2.id, test_user_id)

    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 2
    assert all(t.user_id == test_user_id for t in transactions)

@pytest.mark.asyncio
async def test_fetch_reward_user_transactions_no_transactions(db_sess, test_user_id):
    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 0

@pytest.mark.asyncio
async def test_delete_last_reward_transaction_success(db_sess, test_user_id):
    reward_in = RewardCreate(name="Test Reward", description="Desc", price=10, quantity_left=2)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    await reward_transaction_crud.create_reward_transaction(db_sess, created_reward.id, test_user_id)
    await reward_transaction_crud.create_reward_transaction(db_sess, created_reward.id, test_user_id)

    deleted = await reward_transaction_crud.delete_last_reward_transaction(db_sess, created_reward.id, test_user_id)
    assert deleted is True

    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 1

@pytest.mark.asyncio
async def test_delete_last_reward_transaction_not_found(db_sess, test_user_id):
    deleted = await reward_transaction_crud.delete_last_reward_transaction(db_sess, 999, test_user_id)
    assert deleted is False

@pytest.mark.asyncio
async def test_fetch_reward_transaction_by_id_other_user(db_sess, test_user_id):
    reward_in = RewardCreate(name="Test Reward", description="Desc", price=10, quantity_left=1)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)
    created_transaction = await reward_transaction_crud.create_reward_transaction(db_sess, created_reward.id, test_user_id)

    with pytest.raises(RewardTransactionNotFoundException):
        await reward_transaction_crud.fetch_reward_transaction_by_id(db_sess, created_transaction.id, test_user_id + 1)