from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import db_session
from app.services.scraper_service import ScraperService
from app.models.ScraperSettings import ScraperConfig, ScraperStatus

router = APIRouter(prefix="/scraper", tags=["scraper"])

@router.post("/run/{platform_id}")
async def trigger_manual_scrape(
    platform_id: int, 
    session: Session = Depends(db_session)
):
    """
    Wymusza natychmiastowe pobranie danych dla konkretnej platformy, 
    ignorując harmonogram i okna czasowe.
    """
    service = ScraperService(session)
    try:
        await service.manual_trigger(platform_id)
        return {"status": "success", "message": f"Scrapowanie platformy {platform_id} zakończone."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    finally:
        await service.close()

@router.post("/reset/{platform_id}")
async def reset_scraper_status(
    platform_id: int,
    session: Session = Depends(db_session)
):
    """
    Resetuje status HARD_STOP do ACTIVE dla danej platformy.
    Używane po manualnej weryfikacji połączenia (np. zmianie IP/proxy).
    """
    config = session.exec(
        select(ScraperConfig).where(ScraperConfig.platform_id == platform_id)
    ).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Konfiguracja nie istnieje")
    
    config.status = ScraperStatus.ACTIVE
    config.fail_count = 0
    session.add(config)
    session.commit()
    return {"status": "success", "message": "Scraper został zresetowany."}

@router.post("/twitch-trigger/{platform_id}")
async def twitch_discord_trigger(
    platform_id: int,
    session: Session = Depends(db_session)
):
    """Endpoint wywoływany przez powiadomienie z Discorda."""
    statement = select(ScraperConfig, Platform).join(Platform).where(Platform.id == platform_id)
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    config, platform = result
    service = ScraperService(session)
    url = f"https://www.twitch.tv/{platform.name}"
    asyncio.create_task(service._start_recording(platform.name, "twitch", config, custom_url=url))
    return {"message": "Nagrywanie Twitch rozpoczęte"}