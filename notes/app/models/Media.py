from sqlmodel import SQLModel, Relationship, Field
from typing import Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .Note import Note


class FileType(Enum):
    VIDEO = "video"
    IMG = "img"


class MediaBase(SQLModel):
    name: str
    filepath: str
    filetype: FileType
    note_id: Optional[int] = Field(default=None, foreign_key="note.id")


class Media(MediaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)

    note: Optional["Note"] = Relationship(back_populates="media")


class MediaCreate(MediaBase):
    pass


class MediaRead(MediaBase):
    pass


class MediaUpdate(SQLModel):
    name: Optional[str] = None
    filepath: Optional[str] = None
    filetype: Optional[FileType] = None
    note_id: Optional[int] = None
