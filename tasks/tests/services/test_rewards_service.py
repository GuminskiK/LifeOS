import pytest
from app.services import rewards_service, rewards_crud, vault_crud, reward_transaction_crud
from app.models.Rewards import RewardCreate
from app.core.exceptions.exceptions import BadRequestException, RewardNotFoundException, NotEnoughCurrencyException

@pytest.mark.asyncio
async def test_claim_reward_success(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=10, quantity_left=5)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    # Give user some currency
    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)

    claimed_reward = await rewards_service.claim_reward(db_sess, created_reward.id, test_user_id)

    assert claimed_reward.quantity_left == 4
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 90
    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 1
    assert transactions[0].reward_id == created_reward.id

@pytest.mark.asyncio
async def test_claim_reward_out_of_stock(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=10, quantity_left=0)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)

    with pytest.raises(BadRequestException, match="Reward is out of stock"):
        await rewards_service.claim_reward(db_sess, created_reward.id, test_user_id)

@pytest.mark.asyncio
async def test_claim_reward_not_found(db_sess, test_user_id):
    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)
    with pytest.raises(RewardNotFoundException):
        await rewards_service.claim_reward(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_claim_reward_not_enough_currency(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=100, quantity_left=5)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    await vault_crud.add_points_vault(db_sess, test_user_id, 50, 0) # Only 50 currency

    with pytest.raises(NotEnoughCurrencyException):
        await rewards_service.claim_reward(db_sess, created_reward.id, test_user_id)

@pytest.mark.asyncio
async def test_unclaim_reward_success(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=10, quantity_left=5)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)
    await rewards_service.claim_reward(db_sess, created_reward.id, test_user_id) # Claim once

    vault_before_unclaim = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault_before_unclaim.currency_total == 90
    assert created_reward.quantity_left == 4

    unclaimed_reward = await rewards_service.unclaim_reward(db_sess, created_reward.id, test_user_id)

    assert unclaimed_reward.quantity_left == 5 # Quantity should be incremented back
    vault_after_unclaim = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault_after_unclaim.currency_total == 100 # Currency refunded
    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 0 # Transaction should be deleted

@pytest.mark.asyncio
async def test_unclaim_reward_not_found(db_sess, test_user_id):
    with pytest.raises(RewardNotFoundException):
        await rewards_service.unclaim_reward(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_unclaim_reward_no_transaction_to_delete(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=10, quantity_left=5)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    # No claim was made, so no transaction to delete
    initial_quantity = created_reward.quantity_left
    initial_currency = (await vault_crud.get_or_create_vault(db_sess, test_user_id)).currency_total

    unclaimed_reward = await rewards_service.unclaim_reward(db_sess, created_reward.id, test_user_id)

    assert unclaimed_reward.quantity_left == initial_quantity # Should not change
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == initial_currency # Should not change
    transactions = await reward_transaction_crud.fetch_reward_user_transactions(db_sess, test_user_id)
    assert len(transactions) == 0

@pytest.mark.asyncio
async def test_unclaim_reward_other_user(db_sess, test_user_id):
    reward_in = RewardCreate(name="Potion", description="Heals HP", price=10, quantity_left=5)
    created_reward = await rewards_crud.create_reward(db_sess, reward_in, test_user_id)

    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)
    await rewards_service.claim_reward(db_sess, created_reward.id, test_user_id)

    with pytest.raises(RewardNotFoundException): # fetch_reward_by_id will raise this
        await rewards_service.unclaim_reward(db_sess, created_reward.id, test_user_id + 1)

    # Verify original user's reward and vault are untouched
    original_reward = await rewards_crud.fetch_reward_by_id(db_sess, created_reward.id, test_user_id)
    assert original_reward.quantity_left == 4
    original_vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert original_vault.currency_total == 90