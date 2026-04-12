from sqlmodel import SQLModel, Relationship, Field
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .Note import Note


class FlashNoteBase(SQLModel):
    name: str

    note_id: Optional[int] = Field(default=None, foreign_key="note.id")


class FlashNote(FlashNoteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)
    is_active: bool = Field(default=False)

    # SRS Fields (Notes can be reviewed too)
    next_review: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    interval: int = Field(default=0)
    easiness_factor: float = Field(default=2.5)
    repetitions: int = Field(default=0)

    note: Optional["Note"] = Relationship(back_populates="flashnote")


class FlashNoteCreate(FlashNoteBase):
    pass


class FlashNoteRead(FlashNoteBase):
    pass


class FlashNoteUpdate(SQLModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    next_review: Optional[datetime] = None
    interval: Optional[int] = None
    easiness_factor: Optional[float] = None
    repetitions: Optional[int] = None
