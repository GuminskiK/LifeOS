from sqlmodel import SQLModel, Field, Relationship 
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .Platforms import Platform
    from .Users import User

class CreatorBase(SQLModel):
    name: str = Field(index=True, unique=True)
    
class Creator(CreatorBase, table=True):
    id: Optional[int] = Field(default= None, primary_key=True)
    platforms: List["Platform"] = Relationship(back_populates="creator")

    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="creators")
    
class CreatorCreate(CreatorBase):
    pass

class CreatorRead(CreatorBase):
    pass

class CreatorUpdate(CreatorBase):
    name: Optional[str] = None