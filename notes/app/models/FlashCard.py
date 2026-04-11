from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import JSON

class FlashCardBase(SQLModel):
    name: str
    front: Optional[dict] = Field(default=None, sa_type=JSON)
    reverse: Optional[dict] = Field(default=None, sa_type=JSON)

class FlashCard(FlashCardBase, table = True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)
    is_active: bool = Field(default=False)
    
    # SRS Fields
    next_review: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    interval: int = Field(default=0)  # Days
    easiness_factor: float = Field(default=2.5)
    repetitions: int = Field(default=0)

class FlashCardCreate(FlashCardBase):
    pass

class FlashCardRead(FlashCardBase):
    pass

class FlashCardUpdate(SQLModel):
    name: Optional[str] = None
    front: Optional[dict] = None
    reverse: Optional[dict] = None
    is_active: Optional[bool] = None
    next_review: Optional[datetime] = None
    interval: Optional[int] = None
    easiness_factor: Optional[float] = None
    repetitions: Optional[int] = None