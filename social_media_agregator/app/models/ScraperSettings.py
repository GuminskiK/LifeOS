from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict
from sqlalchemy import JSON
from enum import Enum
from datetime import datetime, time

class ScraperStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    HARD_STOP = "hard_stop" # Po wykryciu bota

class ScraperConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    platform_id: int = Field(foreign_key="platform.id")
    
    # Okno czasowe aktywności (np. 18:00 - 02:00)
    active_from: Optional[time] = Field(default=None, description="Godzina rozpoczęcia pooling-u")
    active_to: Optional[time] = Field(default=None, description="Godzina zakończenia pooling-u")

    status: ScraperStatus = Field(default=ScraperStatus.ACTIVE)
    
    # Ustawienia jakości i filtrów
    target_quality: int = Field(default=720, description="Max wysokość wideo (np. 1080)")
    exclude_shorts: bool = Field(default=False)

    # Stan dla logiki TikTok/Live
    live_check_until: Optional[datetime] = Field(default=None, description="Do kiedy intensywnie sprawdzać Live")

    # Przechowuje logikę: {"method": "pooling", "interval_min": 15, "jitter_sec": 300}
    # Albo: {"method": "cron", "hours": [8, 12, 18], "days": "mon-fri"}
    schedule_config: Dict = Field(default={}, sa_type=JSON)
    
    # Ostatnie sprawdzenie i sukcesy
    last_run: Optional[datetime] = None
    fail_count: int = Field(default=0)
    
    user_agent_override: Optional[str] = None
