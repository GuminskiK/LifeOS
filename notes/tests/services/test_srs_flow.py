import pytest
from datetime import datetime, timezone, timedelta
from app.models.FlashCard import FlashCardCreate
from app.services import flash_card_crud, srs_logic_service

@pytest.mark.asyncio
async def test_srs_review_cycle(session, test_user_id):
    # 1. Tworzenie nowej fiszki
    fc_in = FlashCardCreate(
        name="Test Card",
        front={"text": "Pytanie"},
        reverse={"text": "Odpowiedź"}
    )
    card = await flash_card_crud.create_flash_card(session, fc_in, test_user_id)
    card.is_active = True
    session.add(card)
    await session.commit()

    # 2. Sprawdzenie czy jest w "due" (nowe karty mają next_review = now)
    due = await srs_logic_service.fetch_due_cards(session, test_user_id)
    assert any(c.id == card.id for c in due["flash_cards"])

    # 3. Wykonanie powtórki (Quality: 5 - idealnie)
    # Według SM-2: pierwsza powtórka z Q5 ustawia interwał na 1 dzień
    updated_card = await srs_logic_service.process_review_result(
        session, test_user_id, card.id, "card", 5
    )
    
    assert updated_card.repetitions == 1
    assert updated_card.interval == 1
    # Compare naive datetimes to avoid SQLite timezone stripping issues
    now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
    assert updated_card.next_review.replace(tzinfo=None) > now_naive

    # 4. Sprawdzenie czy zniknęła z "due" na teraz
    due_after = await srs_logic_service.fetch_due_cards(session, test_user_id)
    assert not any(c.id == card.id for c in due_after["flash_cards"])

    # 5. Resetowanie postępu
    reset_card = await srs_logic_service.reset_card_progress(
        session, card.id, "card", test_user_id
    )
    assert reset_card.repetitions == 0
    assert reset_card.interval == 0