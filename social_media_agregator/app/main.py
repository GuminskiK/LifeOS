import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
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

from contextlib import asynccontextmanager
from app.core.scheduler import start_scheduler, scheduler

from app.api.routers import posts, scraper, aggregator, creators, platforms

setup_logging(json_logs=False, log_level="INFO")

@asynccontextmanager
async def lifespan(app: FastAPI):
    from sqlmodel import SQLModel, select
    from sqlmodel.ext.asyncio.session import AsyncSession
    from app.api.deps import db_deps
    from app.models import Post, User
    try:
        engine = db_deps.get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
            print("Successfully initialized missing tables in lifeos_social_media!")
        
        # Zapewnij istnienie użytkownika o ID 1, aby uniknąć błędów klucza obcego w dev
        async with AsyncSession(engine) as session:
            statement = select(User).where(User.id == 1)
            result = await session.exec(statement)
            if not result.first():
                dev_user = User(id=1, username="admin", hashed_password="dev_password")
                session.add(dev_user)
                await session.commit()
                print("Seeded default dev user (ID: 1)")

    except Exception as e:
        print(f"Skipping DB initialization, likely not reachable: {e}")
    
    # Start schedulera przy starcie apki
    start_scheduler()
    yield
    # Zatrzymanie przy wyłączaniu apki
    scheduler.shutdown()

app = FastAPI( title=settings.APP_NAME, root_path="/api", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(StructlogMiddleware)

# Serwowanie pobranych mediów (filmy i zdjęcia)
os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

app.include_router(posts)
app.include_router(scraper)
app.include_router(aggregator)
app.include_router(creators)
app.include_router(platforms)


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
