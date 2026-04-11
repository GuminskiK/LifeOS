from fastapi import APIRouter, Depends, Query, status
from app.api.deps import db_session, current_active_user
from app.services import srs_logic_service
from app.models.FlashCard import FlashCardRead
from typing import List, Dict, Any

router = APIRouter()

@router.get("/due")
async def get_due_items(
    session: db_session,
    owner: current_active_user
):
    """Zwraca listę wszystkich fiszek i notatek zaplanowanych na dziś."""
    return await srs_logic_service.fetch_due_cards(session, owner.id)

@router.get("/difficult", response_model=List[FlashCardRead])
async def get_difficult_cards(
    session: db_session,
    owner: current_active_user,
    limit: int = Query(20, ge=1, le=100),
):
    """Pobiera nowe oraz najtrudniejsze fiszki (niski Easiness Factor)."""
    return await srs_logic_service.fetch_new_and_difficult_cards(session, owner.id, limit)

@router.post("/review")
async def submit_review(
    session: db_session,
    owner: current_active_user,
    item_id: int,
    item_type: str, # "card" lub "note"
    quality: int = Query(..., ge=0, le=5, description="0: total failure, 5: perfect"),
    
):
    """Przetwarza wynik powtórki i aktualizuje parametry SRS w bazie."""
    result = await srs_logic_service.process_review_result(
        session, owner.id, item_id, item_type, quality
    )
    return result

@router.post("/reset/{item_type}/{item_id}")
async def reset_progress(
    item_type: str,
    item_id: int,
    session: db_session,
    owner: current_active_user
):
    """Całkowity reset postępu (trudniejszy do kliknięcia na froncie)."""
    return await srs_logic_service.reset_card_progress(
        session, item_id, item_type, owner.id
    )