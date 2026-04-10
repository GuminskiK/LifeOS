from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.services.tasks_crud import (
    create_task, fetch_task_by_id, fetch_user_tasks, update_task, remove_task
)
from app.services.tasks_service import task_done, task_undone
from app.models.Tasks import TaskRead, TaskUpdate, TaskCreate
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskRead, status_code=201)
async def post_task(
    session: db_session, user: current_active_user, task: TaskCreate
):
    return await create_task(session, task, user.id )

@router.get("/{task_id}", response_model=TaskRead, status_code=200)
async def get_task(
    session: db_session, user: current_active_user, task_id: int
):
    return await fetch_task_by_id(session, task_id, user.id )

@router.get("", response_model=List[TaskRead], status_code=200)
async def get_user_tasks(
    session: db_session, user: current_active_user
):
    return await fetch_user_tasks(session, user.id )

@router.patch("/{task_id}", response_model=TaskRead, status_code=200)
async def patch_task(
    session: db_session, user: current_active_user, task_id: int, task_update: TaskUpdate
):
    return await update_task(session, task_update, task_id, user.id )

@router.delete("/{task_id}", response_model=None, status_code=204)
async def delete_task(
    session: db_session, user: current_active_user, task_id: int
):
    return await remove_task(session, task_id, user.id )

@router.post("/{task_id}/done", response_model=TaskRead, status_code=200)
async def post_task_done(
    session: db_session, user: current_active_user, task_id: int
):
    return await task_done(session, task_id, user.id )

@router.post("/{task_id}/undone", response_model=TaskRead, status_code=200)
async def post_task_undone(
    session: db_session, user: current_active_user, task_id: int
):
    return await task_undone(session, task_id, user.id )
