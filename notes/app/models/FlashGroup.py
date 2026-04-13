from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class FlashGroupBase(SQLModel):
    name: str = Field(index=True)
    group_type: str = Field(index=True) # "card" lub "note"
    parent_id: Optional[int] = Field(default=None, foreign_key="flashgroup.id")

class FlashGroup(FlashGroupBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)

class FlashGroupCreate(FlashGroupBase):
    pass

class FlashGroupRead(FlashGroupBase):
    id: int
    owner_id: int

class FlashGroupUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
