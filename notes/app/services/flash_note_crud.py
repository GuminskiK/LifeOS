from app.api.deps import db_session
from app.models.FlashNote import FlashNote, FlashNoteCreate, FlashNoteUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import FlashNoteNotFoundException


async def create_flash_note(
    session: db_session, flash_note_in: FlashNoteCreate, owner_id: int
):
    db_flash_note = FlashNote(**flash_note_in.model_dump(), owner_id=owner_id)
    session.add(db_flash_note)
    await session.commit()
    await session.refresh(db_flash_note)
    return db_flash_note


async def fetch_flash_note_by_id(
    session: db_session, flash_note_id: int, owner_id: int
):
    result = await session.exec(
        select(FlashNote).where(
            FlashNote.id == flash_note_id, FlashNote.owner_id == owner_id
        )
    )
    flash_note = result.one_or_none()
    if not flash_note:
        raise FlashNoteNotFoundException()
    return flash_note


async def fetch_user_flash_notes(session: db_session, owner_id: int):
    result = await session.exec(select(FlashNote).where(FlashNote.owner_id == owner_id))
    flash_notes = result.all()
    return flash_notes


async def update_flash_note(
    session: db_session,
    flash_note_update: FlashNoteUpdate,
    flash_note_id: int,
    owner_id: int,
):
    result = await session.exec(
        select(FlashNote).where(
            FlashNote.id == flash_note_id, FlashNote.owner_id == owner_id
        )
    )
    db_flash_note = result.one_or_none()
    if not db_flash_note:
        raise FlashNoteNotFoundException()

    update_data = flash_note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_flash_note, key, value)

    session.add(db_flash_note)
    await session.commit()
    await session.refresh(db_flash_note)
    return db_flash_note


async def delete_flash_note(session: db_session, flash_note_id: int, owner_id: int):
    result = await session.exec(
        select(FlashNote).where(
            FlashNote.id == flash_note_id, FlashNote.owner_id == owner_id
        )
    )
    db_flash_note = result.one_or_none()
    if not db_flash_note:
        raise FlashNoteNotFoundException()

    await session.delete(db_flash_note)
    await session.commit()
    return None
