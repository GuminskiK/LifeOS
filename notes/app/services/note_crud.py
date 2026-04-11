from app.api.deps import db_session
from app.models.Note import Note, NoteCreate, NoteUpdate
from sqlmodel import select, cast, String
from app.core.exceptions.exceptions import NoteNotFoundException
from typing import Optional, List
from app.services.note_link_service import sync_note_links


async def create_note(session: db_session, note_in: NoteCreate, owner_id: int):
    db_note = Note(**note_in.model_dump(), owner_id=owner_id)
    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)

    # Synchronizacja odnośników po utworzeniu
    await sync_note_links(session, db_note.id, db_note.content)
    return db_note


async def search_notes(session: db_session, query: str, owner_id: int) -> List[Note]:
    """Wyszukuje notatki po nazwie lub zawartości JSON (content)."""
    statement = select(Note).where(
        Note.owner_id == owner_id,
        (Note.name.ilike(f"%{query}%"))
        | (cast(Note.content, String).ilike(f"%{query}%")),
    )
    result = await session.exec(statement)
    return result.all()


async def fetch_note_by_id(session: db_session, note_id: int, owner_id: int):
    result = await session.exec(
        select(Note).where(Note.id == note_id, Note.owner_id == owner_id)
    )
    note = result.one_or_none()
    if not note:
        raise NoteNotFoundException()
    return note


async def fetch_user_notes(session: db_session, owner_id: int):
    result = await session.exec(select(Note).where(Note.owner_id == owner_id))
    notes = result.all()
    return notes


async def update_note(
    session: db_session, note_update: NoteUpdate, note_id: int, owner_id: int
):
    result = await session.exec(
        select(Note).where(Note.id == note_id, Note.owner_id == owner_id)
    )
    db_note = result.one_or_none()
    if not db_note:
        raise NoteNotFoundException()

    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)

    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)

    # Synchronizacja odnośników przy każdej aktualizacji treści
    if "content" in update_data:
        await sync_note_links(session, db_note.id, db_note.content)
    return db_note


async def delete_note(session: db_session, note_id: int, owner_id: int):
    result = await session.exec(
        select(Note).where(Note.id == note_id, Note.owner_id == owner_id)
    )
    db_note = result.one_or_none()
    if not db_note:
        raise NoteNotFoundException()

    await session.delete(db_note)
    await session.commit()
    return None


async def move_note(
    session: db_session, note_id: int, folder_id: Optional[int], owner_id: int
):
    """Przenosi notatkę do innego folderu."""
    db_note = await fetch_note_by_id(session, note_id, owner_id)
    db_note.folder_id = folder_id
    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)
    return db_note
