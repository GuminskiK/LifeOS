from fastapi import APIRouter
from app.api.deps import db_session, current_active_user
from app.models.Vault import VaultRead
from app.services.vault_crud import get_or_create_vault

router = APIRouter(prefix="/vault", tags=["vault"])

@router.get("/me", response_model=VaultRead)
async def get_my_vault(session: db_session, user: current_active_user):
    return await get_or_create_vault(session, user.id)