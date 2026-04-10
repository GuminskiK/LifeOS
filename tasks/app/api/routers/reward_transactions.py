from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.RewardTransaction import RewardTransaction
from app.services.reward_transaction_crud import fetch_reward_user_transactions
from typing import List

router = APIRouter(prefix="/reward-transactions", tags=["reward_transactions"])

@router.get("", response_model=List[RewardTransaction])
async def get_my_reward_transactions(session: db_session, user: current_active_user):
    return await fetch_reward_user_transactions(session, user.id)