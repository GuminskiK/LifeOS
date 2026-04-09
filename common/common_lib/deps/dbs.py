from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from redis.asyncio import from_url, Redis


class DBDependency:
    def __init__(self, database_url, redis_url):
        self.engine = create_async_engine(
            database_url, future=True, echo=False
        )
        self.redis_url = from_url(redis_url, decode_responses=True)
        self.AsyncSessionLocal = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.AsyncSessionLocal() as session:
            yield session

    def get_redis(self) -> Redis:
        return self.redis_url
    