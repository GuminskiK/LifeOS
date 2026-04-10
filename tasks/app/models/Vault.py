from sqlmodel import SQLModel, Field
from typing import Optional

class Vault (SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)
    currency_total: int = Field(default=0)
    xp_total: int = Field(default=0)

class VaultRead(SQLModel):
    currency_total: int
    xp_total: int

class VaultUpdate(SQLModel):
    currency_total: Optional[int] = None
    xp_total: Optional[int] = None