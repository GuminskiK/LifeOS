from app.core.config import settings
from common_lib.deps.dbs import DBDependency
from typing import Annotated
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
import redis.asyncio as redis

db_deps = DBDependency(database_url=settings.DATABASE_URL, redis_url=settings.REDIS_URL)

db_session = Annotated[AsyncSession, Depends(db_deps.get_session)]
redis_client = Annotated[redis.Redis, Depends(db_deps.get_redis)]
