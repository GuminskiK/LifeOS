from app.api.deps import db_session
from app.models.FlashCard import FlashCard, FlashCardCreate, FlashCardUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import FlashCardNotFoundException

async def create_flash_card(session: db_session, flash_card_in: FlashCardCreate, owner_id: int):
    db_flash_card = FlashCard(**flash_card_in.model_dump(), owner_id=owner_id)
    session.add(db_flash_card)
    await session.commit()
    await session.refresh(db_flash_card)
    return db_flash_card

async def fetch_flash_card_by_id(session: db_session, flash_card_id: int, owner_id: int):
    result = await session.exec(select(FlashCard).where(FlashCard.id == flash_card_id, FlashCard.owner_id == owner_id))
    flash_card = result.one_or_none()
    if not flash_card:
        raise FlashCardNotFoundException()
    return flash_card

async def fetch_user_flash_cards(session: db_session, owner_id: int):
    result = await session.exec(select(FlashCard).where(FlashCard.owner_id == owner_id))
    flash_cards = result.all()
    return flash_cards

async def update_flash_card(session: db_session, flash_card_update: FlashCardUpdate, flash_card_id: int, owner_id: int):
    result = await session.exec(select(FlashCard).where(FlashCard.id == flash_card_id, FlashCard.owner_id == owner_id))
    db_flash_card = result.one_or_none()
    if not db_flash_card:
        raise FlashCardNotFoundException()

    update_data = flash_card_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_flash_card, key, value)

    session.add(db_flash_card)
    await session.commit()
    await session.refresh(db_flash_card)
    return db_flash_card

async def delete_flash_card(session: db_session, flash_card_id: int, owner_id: int):
    result = await session.exec(select(FlashCard).where(FlashCard.id == flash_card_id, FlashCard.owner_id == owner_id))
    db_flash_card = result.one_or_none()
    if not db_flash_card:
        raise FlashCardNotFoundException()

    await session.delete(db_flash_card)
    await session.commit()
    return None
