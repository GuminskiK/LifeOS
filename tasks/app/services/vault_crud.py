from app.api.deps import db_session
from app.models.Vault import Vault, VaultUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import NotEnoughCurrencyException

async def get_or_create_vault(session: db_session, owner_id: int):
    result = await session.exec(select(Vault).where(Vault.owner_id == owner_id))
    db_vault = result.one_or_none()
    if not db_vault:
        db_vault = Vault(owner_id=owner_id, currency_total=0, xp_total=0)
        session.add(db_vault)
        await session.commit()
        await session.refresh(db_vault)
    return db_vault

async def update_vault(session: db_session, vault_update: VaultUpdate, owner_id: int):
    db_vault = await get_or_create_vault(session, owner_id)

    update_data = vault_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vault, key, value)

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault)
    return db_vault

async def add_points_vault(session: db_session, owner_id: int, currency: int, xp: int):
    db_vault = await get_or_create_vault(session, owner_id)

    db_vault.currency_total += currency
    db_vault.xp_total += xp

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault)
    return db_vault

async def subtract_points_vault(session: db_session, owner_id: int, currency: int, xp: int):
    db_vault = await get_or_create_vault(session, owner_id)

    db_vault.currency_total -= currency
    db_vault.xp_total -= xp

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault)
    return db_vault

async def spend_currency(session: db_session, owner_id: int, currency: int):
    db_vault = await get_or_create_vault(session, owner_id)

    if db_vault.currency_total < currency:
        raise NotEnoughCurrencyException()

    db_vault.currency_total -= currency

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault)
    return db_vault

async def refund_currency(session: db_session, owner_id: int, currency: int):
    db_vault = await get_or_create_vault(session, owner_id)

    db_vault.currency_total += currency

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault)
    return db_vault    
