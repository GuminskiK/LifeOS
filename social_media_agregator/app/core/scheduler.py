import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.api.deps import db_deps
from app.services.scraper_service import ScraperService

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def run_scraper_task():
    """Zadanie opakowujące cykl scrapowania w sesję bazy danych."""
    logger.info("Starting scheduled scraper check...")
    async for session in db_deps.get_session():
        service = ScraperService(session)
        try:
            await service.process_active_configs()
        except Exception as e:
            logger.error(f"Error during scheduled scraper task: {e}")
        finally:
            await service.close()

def start_scheduler():
    """Inicjalizacja i uruchomienie schedulera."""
    # Sprawdzamy co minutę. 
    # max_instances=1 gwarantuje, że jeśli scrapowanie potrwa dłużej, nie odpalimy kolejnego równolegle.
    scheduler.add_job(
        run_scraper_task, "interval", minutes=1, id="social_agregator_job", replace_existing=True, max_instances=1
    )
    scheduler.start()
    logger.info("APScheduler started: social_agregator_job added.")