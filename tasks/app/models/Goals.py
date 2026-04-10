from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
if TYPE_CHECKING:
    from .Streak import Streak

class Goals (SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    streak_id: Optional[int] = Field(default=None, foreign_key="streak.id")
    length: int
    reward: int
    is_archive: bool = Field(default=False)

    streak: Optional["Streak"] = Relationship(back_populates="goals")