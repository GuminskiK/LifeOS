from app.core.config import settings
from common_lib.deps.dbs import DBDependency
from common_lib.deps.users import AuthDependency, CurrentUserContext
from typing import Annotated
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
import redis.asyncio as redis

db_deps = DBDependency(database_url=settings.DATABASE_URL, redis_url=settings.REDIS_URL)
auth_deps = AuthDependency(secret_key=settings.SECRET_KEY, algorithm=settings.ALGORITHM, app_name=settings.APP_NAME)

db_session = Annotated[AsyncSession, Depends(db_deps.get_session)]
redis_client = Annotated[redis.Redis, Depends(db_deps.get_redis)]

current_active_user = Annotated[CurrentUserContext, Depends(auth_deps.get_current_active_user)]
current_admin_user = Annotated[CurrentUserContext, Depends(auth_deps.get_current_admin_user)]
owner_or_admin = Annotated[CurrentUserContext, Depends(auth_deps.get_current_owner_or_admin_user)]