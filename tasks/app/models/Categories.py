from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .Tasks import Task

class CategoryBase(SQLModel):
    name: str
    description: Optional[str] = None
   

class Category(CategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)

    tasks: List["Task"] = Relationship(back_populates="category")
    
class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None