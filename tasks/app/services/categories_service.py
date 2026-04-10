from app.api.deps import db_session
from datetime import datetime
from app.models.DateType import DateType
from app.models.ExperienceTransaction import ExperienceTransaction
from sqlmodel import select
from typing import List, Dict, Any
from collections import defaultdict

async def get_stats(session: db_session, user_id: int, start_date: datetime, end_date: datetime, batch: DateType, categories_ids: List[int]) -> List[Dict[str, Any]]:

    query = select(ExperienceTransaction).where(
        ExperienceTransaction.user_id == user_id,
        ExperienceTransaction.timestamp >= start_date,
        ExperienceTransaction.timestamp <= end_date
    )
    if categories_ids:
        query = query.where(ExperienceTransaction.category_id.in_(categories_ids))

    result = await session.exec(query)
    transactions = result.all()

    grouped_data = defaultdict(int)

    for tx in transactions:
        tx_date = tx.timestamp
        
        if batch == DateType.DAY:
            key = tx_date.strftime("%Y-%m-%d")
        elif batch == DateType.WEEK:
            key = tx_date.strftime("%Y-%W")
        elif batch == DateType.MONTH:
            key = tx_date.strftime("%Y-%m")
        elif batch == DateType.YEAR:
            key = tx_date.strftime("%Y")
        else:
            key = tx_date.strftime("%Y-%m-%d")

        grouped_data[key] += tx.amount

    stats = [{"date": k, "earned_xp": v} for k, v in sorted(grouped_data.items())]

    return stats