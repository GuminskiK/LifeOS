from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Rewards import RewardRead, RewardCreate, RewardUpdate
from app.services.rewards_crud import create_reward, fetch_user_rewards, update_reward, delete_reward
from app.services.rewards_service import claim_reward, unclaim_reward
from typing import List

router = APIRouter(prefix="/rewards", tags=["rewards"])

@router.post("", response_model=RewardRead, status_code=201)
async def post_reward(session: db_session, user: current_active_user, reward_in: RewardCreate):
    return await create_reward(session, reward_in, user.id)

@router.get("", response_model=List[RewardRead])
async def get_rewards(session: db_session, user: current_active_user):
    return await fetch_user_rewards(session, user.id)

@router.patch("/{reward_id}", response_model=RewardRead)
async def patch_reward(session: db_session, user: current_active_user, reward_id: int, update: RewardUpdate):
    return await update_reward(session, update, reward_id, user.id)

@router.delete("/{reward_id}", status_code=204)
async def remove_reward(session: db_session, user: current_active_user, reward_id: int):
    return await delete_reward(session, reward_id, user.id)

@router.post("/{reward_id}/claim", response_model=RewardRead)
async def post_claim_reward(session: db_session, user: current_active_user, reward_id: int):
    return await claim_reward(session, reward_id, user.id)

@router.post("/{reward_id}/unclaim", response_model=RewardRead)
async def post_unclaim_reward(session: db_session, user: current_active_user, reward_id: int):
    return await unclaim_reward(session, reward_id, user.id)