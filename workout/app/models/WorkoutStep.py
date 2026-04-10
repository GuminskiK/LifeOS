from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING, Optional
from app.models.Exercise import StepType, GoalType
from datetime import datetime # Dodano import datetime
from sqlalchemy import JSON
if TYPE_CHECKING:
    from .Exercise import Exercise
    from .Workout import Workout

class WorkoutStepBase(SQLModel):

    workout_id: int = Field(foreign_key="workout.id")
    order_index: int = Field(nullable=False)
    
    type: StepType = Field(default=StepType.EXERCISE)
    exercise_id: Optional[int] = Field(foreign_key="exercise.id", nullable=True)
    
    goal_type: GoalType = Field(default=GoalType.REPS)
    goal_value: int = Field(nullable=False)
    
    # System progresji w JSON: np. {"increment": 2, "target": 20, "next_exercise_id": 5}
    progression_config: Optional[dict] = Field(default=None, sa_type=JSON)


class WorkoutStep(WorkoutStepBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)    
    
    workout: Optional["Workout"] = Relationship(back_populates="steps")
    exercise: Optional["Exercise"] = Relationship(back_populates="steps")

class WorkoutStepCreate(WorkoutStepBase):
    pass

class WorkoutStepRead(WorkoutStepBase):
    id: int
    #exercise: Optional[ExerciseRead] = None

class WorkoutStepUpdate(SQLModel):
    workout_id: Optional[int] = None
    order_index: Optional[int] = None
    goal_value: Optional[int] = None
    progression_config: Optional[dict] = None