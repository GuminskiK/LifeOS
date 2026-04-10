from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
if TYPE_CHECKING:
    from .Streak import Streak

class GoalsBase(SQLModel):
    streak_id: Optional[int] = Field(default=None, foreign_key="streak.id")
    length: int
    reward: int
    is_archive: bool = Field(default=False)

class Goals(GoalsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")

    streak: Optional["Streak"] = Relationship(back_populates="goals")

class GoalsCreate(GoalsBase):
    pass

class GoalsRead(GoalsBase):
    id: int

class GoalsUpdate(SQLModel):
    length: Optional[int] = None
    reward: Optional[int] = None
    is_archive: Optional[bool] = None