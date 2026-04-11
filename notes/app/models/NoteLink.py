from sqlmodel import SQLModel, Field


class NoteLink(SQLModel, table=True):
    """Model przechowujący powiązania między notatkami (graf odnośników)."""

    source_note_id: int = Field(
        foreign_key="note.id", primary_key=True, ondelete="CASCADE"
    )
    target_note_id: int = Field(
        foreign_key="note.id", primary_key=True, ondelete="CASCADE"
    )
