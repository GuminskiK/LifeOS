from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, List

class CategoryBase(SQLModel):
    name: str
    description: Optional[str]
   

class Category(CategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    
class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str]
    description: Optional[str]