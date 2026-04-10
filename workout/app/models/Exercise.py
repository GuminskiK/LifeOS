from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from sqlalchemy import JSON
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .WorkoutStep import WorkoutStep

class StepType(Enum):
    EXERCISE = "exercise" # Zmieniono na EXERCISE
    BREAK = "break"

class GoalType(Enum):
    REPS = "reps"
    TIME = "time"

class ExerciseBase(SQLModel):
    owner_id: int = Field(index=True)  # Z JWT
    name: str = Field(nullable=False)
    description: Optional[str] = None
    media_url: Optional[str] = None  # URL do zdjęcia/wideo
    
    # Pole na przyszłość dla AI (np. kąty stawów, parametry techniczne)
    technical_params: Optional[dict] = Field(default=None, sa_type=JSON)

class Exercise(ExerciseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    steps: List["WorkoutStep"] = Relationship(back_populates="exercise")

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseRead(ExerciseBase):
    id: int
    # Możesz dodać steps: List["WorkoutStepRead"] = [] jeśli chcesz je czytać razem z ćwiczeniem
    # Wymagałoby to stworzenia WorkoutStepRead

class ExerciseRead(ExerciseBase):
    pass

class ExerciseUpdate(SQLModel):
    name: Optional[str] = None 
    description: Optional[str] = None
    media_url: Optional[str] = None
    technical_params: Optional[dict] = None