import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_discord_notification(message: str):
    """Wysyła powiadomienie na serwer Discord przez Webhook."""
    webhook_url = getattr(settings, "DISCORD_WEBHOOK_URL", None)
    
    if not webhook_url:
        logger.warning("Discord Webhook URL nie jest skonfigurowany w settings.")
        return

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json={"content": message}
            )
            response.raise_for_status()
            logger.info("Powiadomienie Discord wysłane pomyślnie.")
    except Exception as e:
        logger.error(f"Błąd podczas wysyłania powiadomienia na Discord: {e}")
