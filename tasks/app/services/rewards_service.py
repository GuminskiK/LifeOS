from app.api.deps import db_session
from app.services.rewards_crud import fetch_reward_by_id
from app.services.vault_crud import spend_currency, refund_currency
from app.models.Rewards import Reward
from app.services.reward_transaction_crud import create_reward_transaction, delete_last_reward_transaction
from app.core.exceptions.exceptions import BadRequestException

async def claim_reward(session: db_session, reward_id: int, user_id: int):
    
    db_reward: Reward = await fetch_reward_by_id(session, reward_id, user_id)
    
    if db_reward.quantity_left == 0:
        raise BadRequestException("Reward is out of stock")

    await spend_currency(session, user_id, db_reward.price)
    
    if db_reward.quantity_left > 0:
        db_reward.quantity_left -= 1

    await create_reward_transaction(session, db_reward.id, user_id)
    
    session.add(db_reward)
    await session.commit()
    await session.refresh(db_reward)

    return db_reward

async def unclaim_reward(session: db_session, reward_id: int, user_id: int):
    
    db_reward: Reward = await fetch_reward_by_id(session, reward_id, user_id)
    
    did_delete = await delete_last_reward_transaction(session, reward_id, user_id)
    
    if did_delete:
        await refund_currency(session, user_id, db_reward.price)
        # Note: quantity_left = -1 could mean unlimited, so if it's > -1 or similar, we should increment it.
        # But since we decremented it only if it was > 0, we can safely assume if it was decremented it was >= 0 now.
        if db_reward.quantity_left >= 0:
            db_reward.quantity_left += 1

    session.add(db_reward)
    await session.commit()
    await session.refresh(db_reward)
    
    return db_reward