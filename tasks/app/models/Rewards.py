from sqlmodel import SQLModel, Field
from typing import Optional

class Reward (SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    name: str
    description: Optional[str]
    price: int
    quantity_left: int