import pytest
from app.services import goals_crud
from app.models.Goals import GoalsCreate, GoalsUpdate
from app.core.exceptions.exceptions import GoalsNotFoundException

@pytest.mark.asyncio
async def test_create_goal_success(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    assert goal.id is not None
    assert goal.length == 10
    assert goal.reward == 100
    assert goal.owner_id == test_user_id

@pytest.mark.asyncio
async def test_fetch_goal_by_id_success(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    fetched_goal = await goals_crud.fetch_goal_by_id(db_sess, created_goal.id, test_user_id)
    assert fetched_goal.id == created_goal.id
    assert fetched_goal.length == created_goal.length

@pytest.mark.asyncio
async def test_fetch_goal_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(GoalsNotFoundException):
        await goals_crud.fetch_goal_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_user_goals_success(db_sess, test_user_id):
    await goals_crud.create_goal(db_sess, GoalsCreate(length=10, reward=100, is_archive=False), test_user_id)
    await goals_crud.create_goal(db_sess, GoalsCreate(length=5, reward=50, is_archive=True), test_user_id)

    goals = await goals_crud.fetch_user_goals(db_sess, test_user_id)
    assert len(goals) == 2
    assert all(g.owner_id == test_user_id for g in goals)

@pytest.mark.asyncio
async def test_fetch_user_goals_no_goals(db_sess, test_user_id):
    goals = await goals_crud.fetch_user_goals(db_sess, test_user_id)
    assert len(goals) == 0

@pytest.mark.asyncio
async def test_update_goal_success(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    update_in = GoalsUpdate(length=15, is_archive=True)
    updated_goal = await goals_crud.update_goal(db_sess, update_in, created_goal.id, test_user_id)

    assert updated_goal.length == 15
    assert updated_goal.is_archive is True

@pytest.mark.asyncio
async def test_update_goal_not_found(db_sess, test_user_id):
    update_in = GoalsUpdate(length=15)
    with pytest.raises(GoalsNotFoundException):
        await goals_crud.update_goal(db_sess, update_in, 999, test_user_id)

@pytest.mark.asyncio
async def test_delete_goal_success(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    await goals_crud.delete_goal(db_sess, created_goal.id, test_user_id)

    with pytest.raises(GoalsNotFoundException):
        await goals_crud.fetch_goal_by_id(db_sess, created_goal.id, test_user_id)

@pytest.mark.asyncio
async def test_delete_goal_not_found(db_sess, test_user_id):
    with pytest.raises(GoalsNotFoundException):
        await goals_crud.delete_goal(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_goal_by_id_other_user(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    with pytest.raises(GoalsNotFoundException):
        await goals_crud.fetch_goal_by_id(db_sess, created_goal.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_update_goal_other_user(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    update_in = GoalsUpdate(length=15)
    with pytest.raises(GoalsNotFoundException):
        await goals_crud.update_goal(db_sess, update_in, created_goal.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_delete_goal_other_user(db_sess, test_user_id):
    goal_in = GoalsCreate(length=10, reward=100, is_archive=False)
    created_goal = await goals_crud.create_goal(db_sess, goal_in, test_user_id)

    with pytest.raises(GoalsNotFoundException):
        await goals_crud.delete_goal(db_sess, created_goal.id, test_user_id + 1)