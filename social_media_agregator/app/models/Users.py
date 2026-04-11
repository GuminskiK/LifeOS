from sqlmodel import SQLModel, Field, Relationship 
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .Creators import Creator

class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)

class User(UserBase, table=True):
    id: int | None = Field(default= None, primary_key=True)
    hashed_password: str = Field()

    creators: List["Creator"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    plain_password: str

class UserRead(UserBase):
    pass

class UserUpdate(SQLModel):
    username: Optional[str] = None
    plain_password: Optional[str] = None