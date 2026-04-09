from typing import Optional
from sqlmodel import SQLModel
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from jose import JWTError, jwt
from structlog.contextvars import bind_contextvars
from common_lib.exceptions import (
    AdminNeededException, AdminOrOwnerNeededException
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


class CurrentUserContext(SQLModel):
    id: int
    username: str
    is_superuser: bool


class AuthDependency:
    def __init__(self, secret_key: str, algorithm: str, app_name: str):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.app_name = app_name
        self.oauth2_scheme = OAuth2PasswordBearer(
            tokenUrl="token", auto_error=False
        )

    async def get_current_active_user(
        self, token: Optional[str] = Depends(
            OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
        )
    ) -> CurrentUserContext:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not token:
            raise credentials_exception

        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                audience=self.app_name + "-api"
            )
            username: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            is_superuser: bool = payload.get("is_superuser", False)

            if username is None or user_id is None:
                raise credentials_exception

            bind_contextvars(active_user=user_id)
            return CurrentUserContext(
                id=user_id, username=username, is_superuser=is_superuser
            )

        except JWTError:
            print(f"Exception! Token was {token}")
            raise credentials_exception

    def get_current_admin_user(self):
        async def _get_current_admin_user(
            current_user: CurrentUserContext = Depends(self.get_current_active_user)
        ) -> CurrentUserContext:
            if not current_user.is_superuser:
                raise AdminNeededException()
            return current_user
        return _get_current_admin_user

    def get_current_owner_or_admin_user(self):
        async def _get_current_owner_or_admin_user(
            user_id: int,
            current_user: CurrentUserContext = Depends(self.get_current_active_user)
        ) -> CurrentUserContext:
            if current_user.id != user_id and not current_user.is_superuser:
                raise AdminOrOwnerNeededException()
            return current_user
        return _get_current_owner_or_admin_user
