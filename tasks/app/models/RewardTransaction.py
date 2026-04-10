from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional

class RewardTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    reward_id: Optional[int] = Field(default=None, foreign_key="reward.id")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))