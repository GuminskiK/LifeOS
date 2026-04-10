from sqlmodel import SQLModel, Field
from typing import Optional

class Vault (SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    currency_total: int = Field(default=0)
    xp_total: int = Field(default=0)

class VaultRead(SQLModel):
    currency_total: int
    xp_total: int