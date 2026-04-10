import pytest
from app.services import tasks_crud
from app.models.Tasks import TaskCreate, TaskUpdate, TaskType
from app.core.exceptions.exceptions import TaskNotFoundException
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_create_task_success(db_sess, test_user_id):
    task_in = TaskCreate(name="New Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc), xp_reward=10, currency_reward=5)
    task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    assert task.id is not None
    assert task.name == "New Task"
    assert task.owner_id == test_user_id
    assert task.xp_reward == 10

@pytest.mark.asyncio
async def test_fetch_task_by_id_success(db_sess, test_user_id):
    task_in = TaskCreate(name="Fetch Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    fetched_task = await tasks_crud.fetch_task_by_id(db_sess, created_task.id, test_user_id)
    assert fetched_task.id == created_task.id
    assert fetched_task.name == created_task.name

@pytest.mark.asyncio
async def test_fetch_task_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(TaskNotFoundException):
        await tasks_crud.fetch_task_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_user_tasks_success(db_sess, test_user_id):
    await tasks_crud.create_task(db_sess, TaskCreate(name="Task 1", type=TaskType.TASK, start_date=datetime.now(timezone.utc)), test_user_id)
    await tasks_crud.create_task(db_sess, TaskCreate(name="Task 2", type=TaskType.TASK, start_date=datetime.now(timezone.utc)), test_user_id)

    tasks = await tasks_crud.fetch_user_tasks(db_sess, test_user_id)
    assert len(tasks) == 2
    assert all(t.owner_id == test_user_id for t in tasks)

@pytest.mark.asyncio
async def test_fetch_user_tasks_no_tasks(db_sess, test_user_id):
    tasks = await tasks_crud.fetch_user_tasks(db_sess, test_user_id)
    assert len(tasks) == 0

@pytest.mark.asyncio
async def test_update_task_success(db_sess, test_user_id):
    task_in = TaskCreate(name="Old Name", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    update_in = TaskUpdate(name="Updated Name", is_archived=True) # Changed 'title' to 'name'
    updated_task = await tasks_crud.update_task(db_sess, update_in, created_task.id, test_user_id)

    assert updated_task.name == "Updated Name"
    assert updated_task.is_archived is True

@pytest.mark.asyncio
async def test_update_task_not_found(db_sess, test_user_id):
    update_in = TaskUpdate(name="Non Existent") # Changed 'title' to 'name'
    with pytest.raises(TaskNotFoundException):
        await tasks_crud.update_task(db_sess, update_in, 999, test_user_id)

@pytest.mark.asyncio
async def test_delete_task_success(db_sess, test_user_id):
    task_in = TaskCreate(name="Task to Delete", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    await tasks_crud.remove_task(db_sess, created_task.id, test_user_id) # Changed delete_task to remove_task

    with pytest.raises(TaskNotFoundException):
        await tasks_crud.fetch_task_by_id(db_sess, created_task.id, test_user_id)

@pytest.mark.asyncio
async def test_delete_task_with_subtasks_success(db_sess, test_user_id):
    parent_task_in = TaskCreate(name="Parent Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    parent_task = await tasks_crud.create_task(db_sess, parent_task_in, test_user_id)

    sub_task_in = TaskCreate(name="Sub Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc), parent_id=parent_task.id)
    parent_task_id = parent_task.id
    sub_task = await tasks_crud.create_task(db_sess, sub_task_in, test_user_id)

    db_sess.expunge_all()

    # Refresh parent_task to load sub_tasks relationship (selectinload in fetch_task_by_id handles this now)
    parent_task = await tasks_crud.fetch_task_by_id(db_sess, parent_task_id, test_user_id)
    assert parent_task.sub_tasks is not None and len(parent_task.sub_tasks) == 1

    await tasks_crud.remove_task(db_sess, parent_task.id, test_user_id, delete_subtasks=True)

    with pytest.raises(TaskNotFoundException):
        await tasks_crud.fetch_task_by_id(db_sess, parent_task.id, test_user_id)
    with pytest.raises(TaskNotFoundException):
        await tasks_crud.fetch_task_by_id(db_sess, sub_task.id, test_user_id)

@pytest.mark.asyncio
async def test_delete_task_not_found(db_sess, test_user_id):
    with pytest.raises(TaskNotFoundException):
        await tasks_crud.remove_task(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_task_by_id_other_user(db_sess, test_user_id):
    task_in = TaskCreate(name="Other User Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    with pytest.raises(TaskNotFoundException):
        await tasks_crud.fetch_task_by_id(db_sess, created_task.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_update_task_other_user(db_sess, test_user_id):
    task_in = TaskCreate(name="Other User Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    update_in = TaskUpdate(name="Attempted Update") # Changed 'title' to 'name'
    with pytest.raises(TaskNotFoundException):
        await tasks_crud.update_task(db_sess, update_in, created_task.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_delete_task_other_user(db_sess, test_user_id):
    task_in = TaskCreate(name="Other User Task", type=TaskType.TASK, start_date=datetime.now(timezone.utc))
    created_task = await tasks_crud.create_task(db_sess, task_in, test_user_id)

    with pytest.raises(TaskNotFoundException):
        await tasks_crud.remove_task(db_sess, created_task.id, test_user_id + 1)
