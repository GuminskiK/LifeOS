from app.api.deps import db_session
from app.models.Categories import Category, CategoryCreate, CategoryUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import CategoryNotFoundException

async def create_category(session: db_session, category: CategoryCreate):
    
    db_category = Category(**category.model_dump)
    session.add(CategoryCreate)(db_category)
    session.commit()
    session.refresh(db_category)

    return db_category


async def fetch_category_by_id(session: db_session, category_id: int):

    result = await session.exec(select(Category).where(Category.id == category_id))
    category = result.one_or_none()

    if not category:
        raise CategoryNotFoundException()

    return category


async def fetch_user_categories(session: db_session, user_id: int):

    result = await session.exec(select(Category).where(Category.owner_id == user_id))
    category = result.all()

    if not category:
        raise CategoryNotFoundException()

    return category

async def update_category(session: db_session, category_update: CategoryUpdate, category_id: int):

    result = await session.exec(select(Category).where(Category.id == category_id))
    db_category = result.one_or_none()

    if not db_category:
        raise CategoryNotFoundException()

    update_data = category_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_category, key, value)

    session.commit(db_category)
    session.refresh(db_category)

    return db_category


async def delete_category(session: db_session, category_id: int):

    result = await session.exec(select(Category).where(Category.id == category_id))
    db_category = result.one_or_none()

    if not db_category:
        raise CategoryNotFoundException()

    session.delete(db_category)
    session.commit()

    return None
