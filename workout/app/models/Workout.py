from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING, Optional
from datetime import datetime # Dodano import datetime

if TYPE_CHECKING:
    from .WorkoutStep import WorkoutStep

class WorkoutBase(SQLModel):
    name: str = Field( nullable=False)
    description: Optional[str] = None
    owner_id: int = Field( index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) # Dodano created_at

class Workout(WorkoutBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    steps: List["WorkoutStep"] = Relationship(
        back_populates="workout", 
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan", 
            "order_by": "WorkoutStep.order_index"
        }
    )

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutRead(WorkoutBase):
    id: int
    steps: List["WorkoutStep"] = [] # Dodano steps do WorkoutRead

class WorkoutUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None

    #Czy nie dodać jakoś steps do Read/Update/Create?