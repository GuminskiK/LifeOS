from sqlmodel import SQLModel, Relationship, Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from .NoteLink import NoteLink
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .Folder import Folder
    from .Media import Media
    from .FlashNote import FlashNote

class NoteBase(SQLModel):
    name: str
    content: Optional[dict] = Field(default=None, sa_type=JSON)
    folder_id: Optional[int] = Field(default=None, foreign_key="folder.id")

class Note(NoteBase, table = True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)

    folder: Optional["Folder"] = Relationship(back_populates="notes")
    media: List["Media"] = Relationship(
        back_populates="note", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    flashnote: Optional["FlashNote"] = Relationship(
        back_populates="note", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    # Notatki, do których linkuje ta notatka
    links_to: List["Note"] = Relationship(
        link_model=NoteLink,
        sa_relationship_kwargs={
            "primaryjoin": "Note.id==NoteLink.source_note_id",
            "secondaryjoin": "Note.id==NoteLink.target_note_id",
        }
    )
    # Notatki, które linkują do tej notatki (backlinks)
    links_from: List["Note"] = Relationship(
        link_model=NoteLink,
        sa_relationship_kwargs={
            "primaryjoin": "Note.id==NoteLink.target_note_id",
            "secondaryjoin": "Note.id==NoteLink.source_note_id",
            "overlaps": "links_to",
        }
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteCreate(NoteBase):
    pass

class NoteRead(NoteBase):
    id: int
    owner_id: int
    created_at: datetime

class NoteUpdate(SQLModel):
    name: Optional[str] = None
    content: Optional[dict] = None
    folder_id: Optional[int] = None