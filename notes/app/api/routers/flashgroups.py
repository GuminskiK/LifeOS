from fastapi import APIRouter, HTTPException
from sqlmodel import select
from typing import List

from app.api.deps import db_session, current_active_user
from app.models.FlashGroup import FlashGroup, FlashGroupCreate, FlashGroupRead, FlashGroupUpdate

router = APIRouter()

@router.get("/", response_model=List[FlashGroupRead])
async def get_flashgroups(session: db_session, owner: current_active_user):
    stmt = select(FlashGroup).where(FlashGroup.owner_id == owner.id)
    groups = (await session.exec(stmt)).all()
    return groups

@router.post("/", response_model=FlashGroupRead)
async def create_flashgroup(
    group_in: FlashGroupCreate, session: db_session, owner: current_active_user
):
    from sqlalchemy.exc import IntegrityError
    group = FlashGroup.model_validate(group_in, update={"owner_id": owner.id})
    session.add(group)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Invalid parent group.")
        
    await session.refresh(group)
    return group

@router.patch("/{group_id}", response_model=FlashGroupRead)
async def update_flashgroup(
    group_id: int, group_in: FlashGroupUpdate, session: db_session, owner: current_active_user
):
    group = await session.get(FlashGroup, group_id)
    if not group or group.owner_id != owner.id:
        raise HTTPException(status_code=404, detail="FlashGroup not found")
        
    update_data = group_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(group, key, value)
        
    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group

@router.delete("/{group_id}")
async def delete_flashgroup(group_id: int, session: db_session, owner: current_active_user):
    group = await session.get(FlashGroup, group_id)
    if not group or group.owner_id != owner.id:
        raise HTTPException(status_code=404, detail="FlashGroup not found")
        
    await session.delete(group)
    await session.commit()
    return {"ok": True}
