from datetime import datetime, timezone, timedelta
from sqlmodel import select, or_, and_
from app.api.deps import db_session
from app.models.FlashCard import FlashCard
from app.models.FlashNote import FlashNote
from app.services.SRS_service import SRSService

async def fetch_due_cards(session: db_session, owner_id: int):
    """Pobiera wszystkie fiszki i notatki-fiszki do powtórki na dziś."""
    now = datetime.now(timezone.utc)
    
    # Pobieramy FlashCards
    fc_stmt = select(FlashCard).where(
        FlashCard.owner_id == owner_id,
        FlashCard.is_active == True,
        FlashCard.next_review <= now
    )
    cards = (await session.exec(fc_stmt)).all()
    
    # Pobieramy FlashNotes
    fn_stmt = select(FlashNote).where(
        FlashNote.owner_id == owner_id,
        FlashNote.is_active == True,
        FlashNote.next_review <= now
    )
    notes = (await session.exec(fn_stmt)).all()
    
    return {"flash_cards": cards, "flash_notes": notes}

async def fetch_new_and_difficult_cards(session: db_session, owner_id: int, limit: int = 20):
    """Pobiera nowe (repetitions=0) oraz trudne (easiness_factor < 2.0) fiszki."""
    stmt = select(FlashCard).where(
        FlashCard.owner_id == owner_id,
        or_(
            FlashCard.repetitions == 0,
            FlashCard.easiness_factor < 2.0
        )
    ).limit(limit)
    
    return (await session.exec(stmt)).all()

async def process_review_result(
    session: db_session, 
    owner_id: int, 
    item_id: int, 
    item_type: str, # "card" lub "note"
    quality: int
):
    """Oblicza nową datę powtórki i aktualizuje obiekt w bazie."""
    if item_type == "card":
        item = await session.get(FlashCard, item_id)
    else:
        item = await session.get(FlashNote, item_id)
        
    if not item or item.owner_id != owner_id:
        return None

    # Używamy logiki z Twojego SRSService
    new_interval, new_reps, new_ef = SRSService.calculate_next_review(
        quality=quality,
        interval=item.interval,
        repetitions=item.repetitions,
        easiness_factor=item.easiness_factor
    )
    
    item.interval = new_interval
    item.repetitions = new_reps
    item.easiness_factor = new_ef
    item.next_review = datetime.now(timezone.utc) + timedelta(days=new_interval)
    
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item

async def reset_card_progress(session: db_session, item_id: int, item_type: str, owner_id: int):
    """Realizuje 'trudny do kliknięcia' reset postępu."""
    if item_type == "card":
        item = await session.get(FlashCard, item_id)
    else:
        item = await session.get(FlashNote, item_id)

    if not item or item.owner_id != owner_id:
        return None

    reset_params = SRSService.get_reset_params()
    
    for key, value in reset_params.items():
        setattr(item, key, value)
    
    item.is_active = True # Opcjonalnie: aktywuj kartę przy resecie
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item
