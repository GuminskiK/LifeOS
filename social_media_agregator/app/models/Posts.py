from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from enum import Enum
from datetime import datetime

if TYPE_CHECKING:
    from .Platforms import Platform

class PostType(str, Enum):
    Text = "text"
    Post = "post"
    Story = "story"
    Short = "short"
    Video = "video"    

class PostBase (SQLModel):
    name: str = Field(default= None)
    text: Optional[str] = Field(default = None)
    source_url: Optional[str] = Field(default = None)
    media_path: Optional[str] = Field(default = None)
    created_at: Optional[datetime] = Field(default = None)

    post_type: PostType = Field(default = None)

    platform_id: int = Field(foreign_key="platform.id")

class Post(PostBase, table=True):
    id: int | None = Field(default= None, primary_key=True)
    platform: Optional["Platform"] = Relationship(back_populates="posts")

class PostCreate(PostBase):
    pass

class PostRead(PostBase):
    pass

class PostUpdate(SQLModel):
    name: Optional[str] = None
    text: Optional[str] = None
    source_url: Optional[str] = None
    media_path: Optional[str] = None
    created_at: Optional[datetime] = None
    post_type: Optional[PostType] = None