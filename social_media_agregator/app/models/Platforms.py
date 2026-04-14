from sqlmodel import SQLModel, Field, Relationship 
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .Posts import Post
    from .Creators import Creator
    
class PlatformType(str, Enum):
    YouTube = "youtube"
    Instagram = "instagram"
    TikTok = "tiktok"
    X = "x"

class PlatformBase(SQLModel):
    name: str = Field(index=True, unique=True)
    platform_type: PlatformType = Field(default=PlatformType.YouTube)

class Platform(PlatformBase, table=True):
    id: int | None = Field(default= None, primary_key=True)
    posts: List["Post"] = Relationship(back_populates="platform")

    creator_id: int = Field(foreign_key="creator.id")
    creator: Optional["Creator"] = Relationship(back_populates="platforms")

class PlatformCreate(PlatformBase):
    creator_id: int

class PlatformRead(PlatformBase):
    id: int
    creator_id: int

class PlatformUpdate(SQLModel):
    name: Optional[str] = None