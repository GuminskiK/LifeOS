from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse
from app.api.deps import db_session, current_active_user
from app.models.Note import NoteRead, NoteCreate, NoteUpdate
from app.services import note_crud, pdf_service
from typing import List, Optional

router = APIRouter()


@router.post("/", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate, session: db_session, owner: current_active_user
):
    return await note_crud.create_note(session, note_in, owner.id)


@router.get("/", response_model=List[NoteRead])
async def list_notes(session: db_session, owner: current_active_user):
    return await note_crud.fetch_user_notes(session, owner.id)


@router.get("/search", response_model=List[NoteRead])
async def search_notes(
    session: db_session,
    owner: current_active_user,
    query: str = Query(..., min_length=1),
):
    """Przeszukuje nazwy oraz treść JSON notatek."""
    return await note_crud.search_notes(session, query, owner.id)


@router.get("/{note_id}", response_model=NoteRead)
async def get_note(note_id: int, session: db_session, owner: current_active_user):
    return await note_crud.fetch_note_by_id(session, note_id, owner.id)


@router.patch("/{note_id}", response_model=NoteRead)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    session: db_session,
    owner: current_active_user,
):
    return await note_crud.update_note(session, note_update, note_id, owner.id)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: int, session: db_session, owner: current_active_user):
    await note_crud.delete_note(session, note_id, owner.id)
    return None


@router.post("/{note_id}/move", response_model=NoteRead)
async def move_note(
    note_id: int,
    session: db_session,
    owner: current_active_user,
    folder_id: Optional[int] = None,
):
    return await note_crud.move_note(session, note_id, folder_id, owner.id)


@router.get("/{note_id}/pdf")
async def export_note_to_pdf(
    note_id: int, session: db_session, owner: current_active_user
):
    note = await note_crud.fetch_note_by_id(session, note_id, owner.id)
    pdf_buffer = await pdf_service.PDFService.generate_note_pdf(note)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={note.name}.pdf"},
    )
