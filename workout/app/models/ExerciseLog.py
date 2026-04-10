from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from json import JSON

if TYPE_CHECKING:
    from .WorkoutSession import WorkoutSession
    from .WorkoutStep import WorkoutStep
    from .Exercise import Exercise

class ExerciseLogBase(SQLModel):
    session_id: int = Field(foreign_key="workoutsession.id")
    workout_step_id: int = Field(foreign_key="workoutstep.id")
    exercise_id: int = Field(foreign_key="exercise.id") # Denormalizacja dla łatwiejszych zapytań
    
    actual_reps: Optional[int] = None
    actual_weight: Optional[float] = None
    actual_time: Optional[int] = None # Czas w sekundach
    
    # Pole na przyszłość dla AI Vision
    raw_data: Optional[JSON] = None
    
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class ExerciseLog(ExerciseLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    session: Optional["WorkoutSession"] = Relationship(back_populates="exercise_logs")
    workout_step: Optional["WorkoutStep"] = Relationship() # No back_populates needed if not querying logs from step
    exercise: Optional["Exercise"] = Relationship() # No back_populates needed if not querying logs from exercise

class ExerciseLogCreate(ExerciseLogBase):
    pass

class ExerciseLogRead(ExerciseLogBase):
    id: int

class ExerciseLogUpdate(SQLModel):
    actual_reps: Optional[int] = None
    actual_weight: Optional[float] = None
    actual_time: Optional[int] = None
    raw_data: Optional[JSON] = None