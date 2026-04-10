from app.api.deps import db_session
from app.models.Rewards import Reward, RewardCreate, RewardUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import RewardNotFoundException

async def create_reward(session: db_session, reward_in: RewardCreate, owner_id: int):
    db_reward = Reward(**reward_in.model_dump(), owner_id=owner_id)
    session.add(db_reward)
    await session.commit()
    await session.refresh(db_reward)
    return db_reward

async def fetch_reward_by_id(session: db_session, reward_id: int, owner_id: int):
    result = await session.exec(select(Reward).where(Reward.id == reward_id, Reward.owner_id == owner_id))
    reward = result.one_or_none()
    if not reward:
        raise RewardNotFoundException()
    return reward

async def fetch_user_rewards(session: db_session, owner_id: int):
    result = await session.exec(select(Reward).where(Reward.owner_id == owner_id))
    rewards = result.all()
    return rewards

async def update_reward(session: db_session, reward_update: RewardUpdate, reward_id: int, owner_id: int):
    result = await session.exec(select(Reward).where(Reward.id == reward_id, Reward.owner_id == owner_id))
    db_reward = result.one_or_none()
    if not db_reward:
        raise RewardNotFoundException()

    update_data = reward_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reward, key, value)

    session.add(db_reward)
    await session.commit()
    await session.refresh(db_reward)
    return db_reward

async def delete_reward(session: db_session, reward_id: int, owner_id: int):
    result = await session.exec(select(Reward).where(Reward.id == reward_id, Reward.owner_id == owner_id))
    db_reward = result.one_or_none()
    if not db_reward:
        raise RewardNotFoundException()

    await session.delete(db_reward)
    await session.commit()
    return None
