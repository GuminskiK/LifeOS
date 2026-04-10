import pytest
from app.services import goal_service, goals_crud, vault_crud
from app.models.Goals import GoalsCreate
from app.models.Vault import Vault
from app.core.exceptions.exceptions import GoalsNotFoundException

@pytest.mark.asyncio
async def test_goal_update_success_achieved(db_sess, test_user_id):
    goal_in = GoalsCreate(length=1, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)
    
    # Ensure vault exists
    await vault_crud.get_or_create_vault(db_sess, test_user_id)

    updated_goal = await goal_service.goal_update(db_sess, created_goal.id, test_user_id, 1)

    assert updated_goal.is_archive is True
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 100

@pytest.mark.asyncio
async def test_goal_update_success_not_achieved(db_sess, test_user_id):
    goal_in = GoalsCreate(length=2, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)
    
    # Ensure vault exists
    await vault_crud.get_or_create_vault(db_sess, test_user_id)

    updated_goal = await goal_service.goal_update(db_sess, created_goal.id, test_user_id, 1)

    assert updated_goal.is_archive is False
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 0

@pytest.mark.asyncio
async def test_goal_update_not_found(db_sess, test_user_id):
    with pytest.raises(GoalsNotFoundException):
        await goal_service.goal_update(db_sess, 999, test_user_id, 1)

@pytest.mark.asyncio
async def test_goal_downgrade_success_unarchived(db_sess, test_user_id):
    goal_in = GoalsCreate(length=1, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)
    
    # Manually set to archived and add reward to vault for testing downgrade
    created_goal.is_archive = True
    db_sess.add(created_goal)
    await db_sess.commit()
    await db_sess.refresh(created_goal)
    await vault_crud.add_points_vault(db_sess, test_user_id, 100, 0)

    vault_before = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault_before.currency_total == 100

    downgraded_goal = await goal_service.goal_downgrade(db_sess, created_goal.id, test_user_id, 0)

    assert downgraded_goal.is_archive is False
    vault_after = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault_after.currency_total == 0

@pytest.mark.asyncio
async def test_goal_downgrade_success_not_unarchived(db_sess, test_user_id):
    goal_in = GoalsCreate(length=1, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)
    
    # Ensure vault exists
    await vault_crud.get_or_create_vault(db_sess, test_user_id)

    downgraded_goal = await goal_service.goal_downgrade(db_sess, created_goal.id, test_user_id, 1) # length is not length + 1

    assert downgraded_goal.is_archive is False # Should remain false
    vault = await vault_crud.get_or_create_vault(db_sess, test_user_id)
    assert vault.currency_total == 0

@pytest.mark.asyncio
async def test_goal_downgrade_not_found(db_sess, test_user_id):
    with pytest.raises(GoalsNotFoundException):
        await goal_service.goal_downgrade(db_sess, 999, test_user_id, 1)