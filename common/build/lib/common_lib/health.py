import os
import shutil
from typing import Any, Tuple

from sqlalchemy import text

class Healthcheck():
    def __init__(self, db_session, redis_client):
        self.session = db_session
        self.redis_client = redis_client

    def check_disk(self, min_free_percent: float = 10.0) -> Tuple[bool, dict]:
        """Return (ok, info) for disk usage check."""
        total, used, free = shutil.disk_usage(os.path.abspath(os.sep))
        free_pct = round(free / total * 100, 2)
        ok = free_pct >= min_free_percent
        return ok, {"free_percent": free_pct}


    async def check_db(self, timeout: int = 3) -> Tuple[bool, Any]:
        try:
            await self.session.exec(text("SELECT 1"))
            return True, None
        except Exception as e:
            return False, str(e)


    async def check_redis(self, timeout: int = 3
    ) -> Tuple[bool, Any]:
        try:
            if await self.redis_client.ping():
                return True, None
            return False, "ping failed"
        except Exception as e:
            return False, str(e)
