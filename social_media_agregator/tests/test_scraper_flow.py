import pytest
from unittest.mock import AsyncMock, patch, Mock
from sqlmodel import select
from app.models.Creators import Creator
from app.models.Platforms import Platform, PlatformType
from app.models.ScraperSettings import ScraperConfig
from app.models.Posts import Post

MOCK_RSS_ATOM = """<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Testowy Film</title>
    <link href="https://www.youtube.com/watch?v=123"/>
    <summary>Opis filmu</summary>
    <published>2023-10-27T12:00:00Z</published>
  </entry>
</feed>"""

@pytest.mark.asyncio
async def test_full_scraper_cycle(db_session, test_user_id):
    # 1. Przygotowanie danych (Creator -> Platform -> Config)
    creator = Creator(name="Gimper", user_id=test_user_id)
    db_session.add(creator)
    await db_session.commit()
    await db_session.refresh(creator)

    platform = Platform(
        name="Gimper", 
        platform_type=PlatformType.YouTube, 
        creator_id=creator.id
    )
    db_session.add(platform)
    await db_session.commit()
    await db_session.refresh(platform)

    config = ScraperConfig(platform_id=platform.id, target_quality=1080)
    db_session.add(config)
    await db_session.commit()

    # 2. Mockowanie RSS Bridge (HTTPX) i yt-dlp (Subprocess)
    with patch("httpx.AsyncClient.get") as mock_get:
        # Ustawiamy mocka dla RSS Bridge
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = MOCK_RSS_ATOM
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        with patch("asyncio.create_subprocess_exec") as mock_exec:
            # Mockujemy proces yt-dlp
            mock_process = AsyncMock()
            mock_process.communicate.return_value = (b"True", b"")
            mock_process.returncode = 0
            mock_exec.return_value = mock_process

            # 3. Uruchomienie Manual Scrape przez serwis
            from app.services.scraper_service import ScraperService
            service = ScraperService(db_session)
            
            # Wykonujemy scrapowanie
            await service.manual_trigger(platform.id)
            await service.close()

            # 4. Weryfikacja efektów w bazie danych
            # Sprawdzamy czy post został dodany
            stmt = select(Post).where(Post.platform_id == platform.id)
            result = await db_session.exec(stmt)
            posts = result.all()

            assert len(posts) == 1
            assert posts[0].name == "Testowy Film"
            assert posts[0].source_url == "https://www.youtube.com/watch?v=123"
            
            # Sprawdzamy czy ScraperConfig zaktualizował last_run
            await db_session.refresh(config)
            assert config.last_run is not None
            
            # Weryfikacja czy RSS Bridge był odpytany o poprawny URL
            mock_get.assert_called()
            called_url = mock_get.call_args[0][0]
            assert "YouTubeBridge" in called_url
            assert "user=Gimper" in called_url