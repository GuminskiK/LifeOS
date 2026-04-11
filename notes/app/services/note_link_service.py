from typing import Any, Set
from sqlmodel import select, delete
from app.api.deps import db_session
from app.models.NoteLink import NoteLink

def extract_note_ids_from_json(content: Any) -> Set[int]:
    """
    Rekurencyjnie przeszukuje JSON w poszukiwaniu identyfikatorów notatek.
    Zakładamy format TipTap/Slate: {"type": "note_link", "attrs": {"id": 123}}
    """
    found_ids = set()

    if isinstance(content, dict):
        # Sprawdzamy czy ten słownik to nasz węzeł linku
        if content.get("type") == "note_link":
            attrs = content.get("attrs", {})
            note_id = attrs.get("id") or attrs.get("note_id")
            if note_id:
                found_ids.add(int(note_id))
        
        # Przeszukujemy wszystkie wartości w słowniku
        for value in content.values():
            found_ids.update(extract_note_ids_from_json(value))
            
    elif isinstance(content, list):
        # Przeszukujemy elementy listy
        for item in content:
            found_ids.update(extract_note_ids_from_json(item))
            
    return found_ids

async def sync_note_links(session: db_session, source_note_id: int, content: dict):
    """Synchronizuje tabelę NoteLink na podstawie aktualnej treści notatki."""
    from app.models.Note import Note  # Import lokalny dla uniknięcia cykli

    # 1. Wyciągnij ID notatek z treści
    target_ids = extract_note_ids_from_json(content)
    
    # 2. Odfiltruj tylko te ID, które faktycznie istnieją w bazie (wymóg klucza obcego)
    valid_target_ids = set()
    if target_ids:
        statement = select(Note.id).where(Note.id.in_(target_ids))
        result = await session.exec(statement)
        valid_target_ids = set(result.all())

    # 2. Usuń stare linki dla tej notatki
    statement = delete(NoteLink).where(NoteLink.source_note_id == source_note_id)
    await session.exec(statement)
    
    # 3. Dodaj nowe linki
    for t_id in valid_target_ids:
        # Unikamy linkowania do samego siebie (opcjonalnie)
        if t_id == source_note_id:
            continue
        new_link = NoteLink(source_note_id=source_note_id, target_note_id=t_id)
        session.add(new_link)
    
    await session.commit()
