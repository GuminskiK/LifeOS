from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from common_lib.health import Healthcheck
from common_lib.rate_limiting import limiter
from app.api.deps import db_session, redis_client
from common_lib.logger.logger import setup_logging
from common_lib.logger.logging_middleware import StructlogMiddleware
from app.core.config import settings
from app.api.routers import categories, goals, reward_transactions, rewards, streaks, tasks, vault

from contextlib import asynccontextmanager

setup_logging(json_logs=False, log_level="INFO")

@asynccontextmanager
async def lifespan(app: FastAPI):
    from sqlmodel import SQLModel
    from app.api.deps import db_deps
    from app.models import Categories, Goals, Rewards, RewardTransaction, Streak, Tasks, Vault
    try:
        engine = db_deps.get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
            print("Successfully initialized missing tables in lifeos_tasks!")
    except Exception as e:
        print(f"Skipping DB initialization, likely not reachable: {e}")
    yield

app = FastAPI(lifespan=lifespan, title=settings.APP_NAME, root_path="/api")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(StructlogMiddleware)

app.include_router(categories.router)
app.include_router(goals.router)
app.include_router(reward_transactions.router)
app.include_router(rewards.router)
app.include_router(streaks.router)
app.include_router(tasks.router)
app.include_router(vault.router)

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

healthcheck = Healthcheck(db_session, redis_client)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health")
async def health():
    result = {"status": "ok", "checks": {}}

    # Disk usage
    disk_ok, disk_info = healthcheck.check_disk()
    result["checks"]["disk"] = disk_info
    if not disk_ok:
        result["status"] = "degraded"

    # DB Check
    db_ok, db_info = await healthcheck.check_db()
    result["checks"]["db"] = {"ok": db_ok, "info": db_info}
    if not db_ok:
        result["status"] = "down"

    # Redis Check
    redis_ok, redis_info = await healthcheck.check_redis()
    result["checks"]["redis"] = {"ok": redis_ok, "info": redis_info}
    if not redis_ok:
        result["status"] = "down"

    return result
