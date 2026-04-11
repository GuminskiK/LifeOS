import pytest
from app.models.Note import NoteCreate, NoteUpdate
from app.models.Folder import FolderCreate
from app.services import note_crud, folder_crud

@pytest.mark.asyncio
async def test_note_and_folder_lifecycle(session, test_user_id):
    # 1. Tworzenie folderów
    f1_in = FolderCreate(name="Projekty")
    folder1 = await folder_crud.create_folder(session, f1_in, test_user_id)
    
    f2_in = FolderCreate(name="Archiwum")
    folder2 = await folder_crud.create_folder(session, f2_in, test_user_id)

    # 2. Tworzenie notatki docelowej, aby link był poprawny technicznie
    note_target_in = NoteCreate(name="Cel", content={})
    note_target = await note_crud.create_note(session, note_target_in, test_user_id)

    # 3. Tworzenie notatki z linkiem (test systemu NoteLink)
    content = {
        "type": "doc",
        "content": [
            {"type": "paragraph", "text": "Zadania na dziś"},
            {"type": "note_link", "attrs": {"id": note_target.id}}
        ]
    }
    note_in = NoteCreate(name="Lista", content=content, folder_id=folder1.id)
    note = await note_crud.create_note(session, note_in, test_user_id)

    assert note.folder_id == folder1.id
    
    # Sprawdzenie czy NoteLink został utworzony automatycznie
    from app.models.NoteLink import NoteLink
    from sqlmodel import select
    links = (await session.exec(select(NoteLink).where(NoteLink.source_note_id == note.id))).all()
    assert len(links) == 1
    assert links[0].target_note_id == note_target.id

    # 4. Przenoszenie notatki
    moved_note = await note_crud.move_note(session, note.id, folder2.id, test_user_id)
    assert moved_note.folder_id == folder2.id

    # 4. Wyszukiwanie wewnątrz JSON (content)
    search_results = await note_crud.search_notes(session, "Zadania", test_user_id)
    assert len(search_results) >= 1
    assert search_results[0].id == note.id

    # 5. Usuwanie i kaskady
    await note_crud.delete_note(session, note.id, test_user_id)
    
    # Sprawdzenie czy linki zniknęły
    links_after = (await session.exec(select(NoteLink).where(NoteLink.source_note_id == note.id))).all()
    assert len(links_after) == 0