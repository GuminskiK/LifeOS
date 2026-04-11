import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import current_active_user
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Tworzy czystą bazę danych dla każdego testu."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture(scope="function")
def client(db_session):
    """Mockuje sesję DB i aktywnego użytkownika."""
    
    async def override_get_session():
        yield db_session

    async def mock_user():
        # Zwracamy uproszczony słownik lub obiekt udający User
        class MockUser:
            id = 1
            username = "testuser"
            is_activated = True
        return MockUser()

    app.dependency_overrides[db_session] = override_get_session
    app.dependency_overrides[current_active_user] = mock_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def test_user_id():
    return 1