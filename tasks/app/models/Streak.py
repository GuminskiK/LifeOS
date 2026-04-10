from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from app.models.DateType import DateType

if TYPE_CHECKING:
    from .Tasks import Task
    from .Goals import Goals

class StreakTaskLink(SQLModel, table=True):
    streak_id: Optional[int] = Field(default=None, foreign_key="streak.id", primary_key=True)
    task_id: Optional[int] = Field(default=None, foreign_key="task.id", primary_key=True)

class StreakBase(SQLModel):
    length: int
    length_type: DateType
    last_length_update: datetime
    counter: int
    occurance_per_length: int

class Streak(StreakBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")

    tasks: List["Task"] = Relationship(back_populates="streaks", link_model=StreakTaskLink)
    goals: List["Goals"] = Relationship(back_populates="streak")

class StreakRead(StreakBase):
    pass

class StreakUpdate(SQLModel):
    length: Optional[int] = None
    length_type: Optional[str] = None
    last_length_update: Optional[datetime] = None
    counter: Optional[int] = None
    occurance_per_length: Optional[int] = None