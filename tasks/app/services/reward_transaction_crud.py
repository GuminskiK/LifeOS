from app.api.deps import db_session
from app.models.RewardTransaction import RewardTransaction
from sqlmodel import select
from app.core.exceptions.exceptions import RewardTransactionNotFoundException

async def create_reward_transaction(session: db_session, reward_id: int, user_id: int):
    db_transaction = RewardTransaction(reward_id=reward_id, user_id=user_id)
    session.add(db_transaction)
    await session.commit()
    await session.refresh(db_transaction)
    return db_transaction

async def fetch_reward_transaction_by_id(session: db_session, transaction_id: int, user_id: int):
    result = await session.exec(select(RewardTransaction).where(RewardTransaction.id == transaction_id, RewardTransaction.user_id == user_id))
    transaction = result.one_or_none()
    if not transaction:
        raise RewardTransactionNotFoundException()
    return transaction

async def fetch_reward_user_transactions(session: db_session, user_id: int):
    result = await session.exec(select(RewardTransaction).where(RewardTransaction.user_id == user_id))
    transactions = result.all()
    return transactions

async def delete_last_reward_transaction(session: db_session, reward_id: int, user_id: int):
    result = await session.exec(
        select(RewardTransaction)
        .where(RewardTransaction.user_id == user_id, RewardTransaction.reward_id == reward_id)
        .order_by(RewardTransaction.timestamp.desc())
    )
    transaction = result.first()
    if transaction:
        await session.delete(transaction)
        await session.commit()
        return True
    return False
