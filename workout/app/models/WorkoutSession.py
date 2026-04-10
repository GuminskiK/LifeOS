from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .Workout import Workout
    from .ExerciseLog import ExerciseLog

class WorkoutSessionStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class WorkoutSessionBase(SQLModel):
    workout_id: int = Field(foreign_key="workout.id")
    owner_id: int = Field(index=True)
    start_time: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    end_time: Optional[datetime] = None
    status: WorkoutSessionStatus = Field(default=WorkoutSessionStatus.ACTIVE, nullable=False)

class WorkoutSession(WorkoutSessionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    workout: Optional["Workout"] = Relationship() # No back_populates needed if not querying sessions from Workout
    exercise_logs: List["ExerciseLog"] = Relationship(
        back_populates="session", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class WorkoutSessionCreate(WorkoutSessionBase):
    pass

class WorkoutSessionRead(WorkoutSessionBase):
    id: int
    exercise_logs: List["ExerciseLog"] = [] # Include logs in read

class WorkoutSessionUpdate(SQLModel):
    end_time: Optional[datetime] = None
    status: Optional[WorkoutSessionStatus] = None
