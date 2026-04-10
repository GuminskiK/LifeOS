from sqlmodel import SQLModel, Field
from typing import Optional

class RewardBase(SQLModel):
    name: str
    description: Optional[str]
    price: int
    quantity_left: int

class Reward(RewardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")

class RewardCreate(RewardBase):
    pass

class RewardRead(RewardBase):
    id: int

class RewardUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    quantity_left: Optional[int] = None