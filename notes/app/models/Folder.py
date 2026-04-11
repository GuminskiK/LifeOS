from sqlmodel import SQLModel, Relationship, Field
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .Note import Note


class FolderBase(SQLModel):
    name: str
    parent_id: Optional[int] = Field(default=None, foreign_key="folder.id")


class Folder(FolderBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True)

    subfolders: List["Folder"] = Relationship(
        back_populates="parent_folder",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    parent_folder: Optional["Folder"] = Relationship(
        back_populates="subfolders", sa_relationship_kwargs={"remote_side": "Folder.id"}
    )

    notes: List["Note"] = Relationship(
        back_populates="folder",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class FolderCreate(FolderBase):
    pass


class FolderRead(FolderBase):
    id: int
    owner_id: int


class FolderUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
