import pytest
from app.services import vault_crud
from app.models.Vault import Vault, VaultUpdate
from app.core.exceptions.exceptions import NotEnoughCurrencyException

@pytest.mark.asyncio
async def test_get_or_create_vault_get_existing(db_sess, test_user_id):
    # Create a vault first
    existing_vault = Vault(owner_id=test_user_id, currency_total=100, xp_total=50)
    db_sess.add(existing_vault)
    await db_sess.commit()
    await db_sess.refresh(existing_vault)

    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.id == existing_vault.id
    assert vault.currency_total == 100
    assert vault.xp_total == 50

@pytest.mark.asyncio
async def test_get_or_create_vault_create_new(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.id is not None
    assert vault.owner_id == test_user_id
    assert vault.currency_total == 0
    assert vault.xp_total == 0

@pytest.mark.asyncio
async def test_update_vault_success(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    update_in = VaultUpdate(currency_total=200, xp_total=150)
    updated_vault = await vault_crud.update_vault(db_sess, update_in, test_user_id)

    assert updated_vault.currency_total == 200
    assert updated_vault.xp_total == 150

@pytest.mark.asyncio
async def test_add_points_vault_success(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    updated_vault = await vault_crud.add_points_vault(db_sess, test_user_id, 50, 25)

    assert updated_vault.currency_total == 50
    assert updated_vault.xp_total == 25

    updated_vault_again = await vault_crud.add_points_vault(db_sess, test_user_id, 10, 5)
    assert updated_vault_again.currency_total == 60
    assert updated_vault_again.xp_total == 30

@pytest.mark.asyncio
async def test_subtract_points_vault_success(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    vault.currency_total = 100
    vault.xp_total = 50
    db_sess.add(vault)
    await db_sess.commit()
    await db_sess.refresh(vault)

    updated_vault = await vault_crud.subtract_points_vault(db_sess, test_user_id, 30, 15)

    assert updated_vault.currency_total == 70
    assert updated_vault.xp_total == 35

@pytest.mark.asyncio
async def test_spend_currency_success(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    vault.currency_total = 100
    db_sess.add(vault)
    await db_sess.commit()
    await db_sess.refresh(vault)

    updated_vault = await vault_crud.spend_currency(db_sess, test_user_id, 40)
    assert updated_vault.currency_total == 60

@pytest.mark.asyncio
async def test_spend_currency_not_enough(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    vault.currency_total = 30
    db_sess.add(vault)
    await db_sess.commit()
    await db_sess.refresh(vault)

    with pytest.raises(NotEnoughCurrencyException):
        await vault_crud.spend_currency(db_sess, test_user_id, 50)

@pytest.mark.asyncio
async def test_refund_currency_success(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    vault.currency_total = 50
    db_sess.add(vault)
    await db_sess.commit()
    await db_sess.refresh(vault)

    updated_vault = await vault_crud.refund_currency(db_sess, test_user_id, 20)
    assert updated_vault.currency_total == 70

@pytest.mark.asyncio
async def test_update_vault_other_user(db_sess, test_user_id):
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    update_in = VaultUpdate(currency_total=200)
    # This should create a new vault for test_user_id + 1, not update the existing one
    updated_vault = await vault_crud.update_vault(db_sess, update_in, test_user_id + 1)

    assert updated_vault.owner_id == test_user_id + 1
    assert updated_vault.currency_total == 200
    
    # Verify original user's vault is untouched
    original_vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert original_vault.currency_total == 0 # Still 0 if not explicitly set
