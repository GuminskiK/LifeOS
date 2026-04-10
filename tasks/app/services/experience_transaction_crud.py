from app.api.deps import db_session
from app.models.ExperienceTransaction import ExperienceTransaction
from sqlmodel import select
from app.core.exceptions.exceptions import ExperienceTransactionNotFoundException

async def create_experience_transaction(session: db_session, transaction_in: dict, user_id: int):
    db_transaction = ExperienceTransaction(**transaction_in, user_id=user_id)
    session.add(db_transaction)
    await session.commit()
    await session.refresh(db_transaction)
    return db_transaction

async def fetch_transaction_by_id(session: db_session, transaction_id: int, user_id: int):
    result = await session.exec(select(ExperienceTransaction).where(ExperienceTransaction.id == transaction_id, ExperienceTransaction.user_id == user_id))
    transaction = result.one_or_none()
    if not transaction:
        raise ExperienceTransactionNotFoundException()
    return transaction

async def fetch_user_transactions(session: db_session, user_id: int):
    result = await session.exec(select(ExperienceTransaction).where(ExperienceTransaction.user_id == user_id))
    transactions = result.all()
    return transactions

async def delete_last_experience_transaction(session: db_session, task_name: str, user_id: int):
    result = await session.exec(
        select(ExperienceTransaction)
        .where(ExperienceTransaction.user_id == user_id, ExperienceTransaction.task_name == task_name)
        .order_by(ExperienceTransaction.timestamp.desc())
    )
    transaction = result.first()
    if transaction:
        await session.delete(transaction)
        await session.commit()
        return True
    return False
