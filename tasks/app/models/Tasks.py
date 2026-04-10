from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING,Optional, List
from datetime import datetime, date
from dateutil.rrule import *
from enum import Enum
from .Streak import StreakTaskLink

if TYPE_CHECKING:
    from .Categories import Category
    from .Streak import Streak

class TaskType(Enum):
    HABIT = "habit" # czynności powtarzalne na wieki wieków
    TIMED_TASK = "timed_task" # task z deadlinem
    TASK = "task" # task bez umieszczenia czasowego
    TIMED_MILESTONE = "timed_milestone" # osiągnięcie z deadlinem
    MILESTONE = "milestone" # osiągnięcie
    EVENT = "event" # wakacje / jakieś spotkanie / event kilku godzinny lub kilku dniowy zdarzenie trwające jakiś czas
    HOLIDAY = "holiday" # imieniny / urodziny / święto - jeden lub kilka dni świątecznych, co roku

class TaskBase(SQLModel):
    name: str
    description: Optional[str] = None
    
    type: TaskType = Field(default=TaskType.TASK)

    start_date: Optional[datetime]
    end_date: Optional[datetime] = None
    
    priority: Optional[int] = None
    recurrence: Optional[str] = None

    is_archived: bool = Field(default=False)

    # Rewards 
    xp_reward: Optional[int] = 10
    currency_reward: Optional[int] = 5
    
    # Relathionship
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="task.id")

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)
    
    category: Optional["Category"] = Relationship(back_populates="tasks")
    sub_tasks: List["Task"] = Relationship(
        back_populates="parent_task"
    )
    parent_task: Optional["Task"] = Relationship(
        back_populates="sub_tasks",
        sa_relationship_kwargs={"remote_side": "Task.id"}
    )
    streaks: List["Streak"] = Relationship(back_populates="tasks", link_model=StreakTaskLink)
    
class TaskRead(TaskBase):
    pass

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    
    type: Optional[TaskType] = None

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    priority: Optional[int] = None
    recurrence: Optional[str] = None

    is_archived: Optional[bool] = None

    # Rewards 
    xp_reward: Optional[int] = None
    currency_reward: Optional[int] = None
    
    # Relathionship
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="task.id")
