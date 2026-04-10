from fastapi import APIRouter, Query
from app.api.deps import db_session, current_active_user
from app.models.Categories import CategoryRead, CategoryCreate, CategoryUpdate
from app.models.DateType import DateType
from app.services.categories_crud import create_category, fetch_category_by_id, fetch_user_categories, update_category, delete_category
from app.services.categories_service import get_stats
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/stats", status_code=200)
async def get_category_stats(
    session: db_session, 
    user: current_active_user,
    start_date: datetime,
    end_date: datetime,
    batch: DateType = DateType.DAY,
    categories_ids: Optional[List[int]] = Query(None)
):
    return await get_stats(session, user.id, start_date, end_date, batch, categories_ids)

@router.post("", response_model=CategoryRead, status_code=201)
async def post_category(session: db_session, user: current_active_user, category: CategoryCreate):
    return await create_category(session, category, user.id)

@router.get("", response_model=List[CategoryRead])
async def get_categories(session: db_session, user: current_active_user):
    return await fetch_user_categories(session, user.id)

@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(session: db_session, user: current_active_user, category_id: int):
    return await fetch_category_by_id(session, category_id, user.id)

@router.patch("/{category_id}", response_model=CategoryRead)
async def patch_category(session: db_session, user: current_active_user, category_id: int, update: CategoryUpdate):
    return await update_category(session, update, category_id, user.id)

@router.delete("/{category_id}", status_code=204)
async def remove_category(session: db_session, user: current_active_user, category_id: int):
    return await delete_category(session, category_id, user.id)