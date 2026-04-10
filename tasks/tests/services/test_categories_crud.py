import pytest
from app.services import categories_crud
from app.models.Categories import CategoryCreate, CategoryUpdate, Category
from app.core.exceptions.exceptions import CategoryNotFoundException

@pytest.mark.asyncio
async def test_create_category_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    assert category.id is not None
    assert category.name == "Work"
    assert category.owner_id == test_user_id

@pytest.mark.asyncio
async def test_fetch_category_by_id_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    fetched_category = await categories_crud.fetch_category_by_id(db_sess, created_category.id, test_user_id)
    assert fetched_category.id == created_category.id
    assert fetched_category.name == created_category.name

@pytest.mark.asyncio
async def test_fetch_category_by_id_not_found(db_sess, test_user_id):
    with pytest.raises(CategoryNotFoundException):
        await categories_crud.fetch_category_by_id(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_user_categories_success(db_sess, test_user_id):
    await categories_crud.create_category(db_sess, CategoryCreate(name="Work", description="Work related tasks"), test_user_id)
    await categories_crud.create_category(db_sess, CategoryCreate(name="Personal", description="Personal tasks"), test_user_id)

    categories = await categories_crud.fetch_user_categories(db_sess, test_user_id)
    assert len(categories) == 2
    assert all(c.owner_id == test_user_id for c in categories)

@pytest.mark.asyncio
async def test_fetch_user_categories_not_found(db_sess):
    with pytest.raises(CategoryNotFoundException):
        await categories_crud.fetch_user_categories(db_sess, 999)

@pytest.mark.asyncio
async def test_update_category_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    update_in = CategoryUpdate(name="Updated Work", description="Updated description")
    updated_category = await categories_crud.update_category(db_sess, update_in, created_category.id, test_user_id)

    assert updated_category.name == "Updated Work"
    assert updated_category.description == "Updated description"

@pytest.mark.asyncio
async def test_update_category_not_found(db_sess, test_user_id):
    update_in = CategoryUpdate(name="Updated Work")
    with pytest.raises(CategoryNotFoundException):
        await categories_crud.update_category(db_sess, update_in, 999, test_user_id)

@pytest.mark.asyncio
async def test_delete_category_success(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    await categories_crud.delete_category(db_sess, created_category.id, test_user_id)

    with pytest.raises(CategoryNotFoundException):
        await categories_crud.fetch_category_by_id(db_sess, created_category.id, test_user_id)

@pytest.mark.asyncio
async def test_delete_category_not_found(db_sess, test_user_id):
    with pytest.raises(CategoryNotFoundException):
        await categories_crud.delete_category(db_sess, 999, test_user_id)

@pytest.mark.asyncio
async def test_fetch_category_by_id_other_user(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    with pytest.raises(CategoryNotFoundException):
        await categories_crud.fetch_category_by_id(db_sess, created_category.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_update_category_other_user(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    update_in = CategoryUpdate(name="Updated Work")
    with pytest.raises(CategoryNotFoundException):
        await categories_crud.update_category(db_sess, update_in, created_category.id, test_user_id + 1)

@pytest.mark.asyncio
async def test_delete_category_other_user(db_sess, test_user_id):
    category_in = CategoryCreate(name="Work", description="Work related tasks")
    created_category = await categories_crud.create_category(db_sess, category_in, test_user_id)

    with pytest.raises(CategoryNotFoundException):
        await categories_crud.delete_category(db_sess, created_category.id, test_user_id + 1)