from app.api.deps import db_session
from app.models.Media import Media, MediaCreate, MediaUpdate
from sqlmodel import select
from app.core.exceptions.exceptions import MediaNotFoundException
import httpx
from bs4 import BeautifulSoup

async def create_media(session: db_session, media_in: MediaCreate, owner_id: int):
    db_media = Media(**media_in.model_dump(), owner_id=owner_id)
    session.add(db_media)
    await session.commit()
    await session.refresh(db_media)
    return db_media

async def fetch_media_by_id(session: db_session, media_id: int, owner_id: int):
    result = await session.exec(select(Media).where(Media.id == media_id, Media.owner_id == owner_id))
    media = result.one_or_none()
    if not media:
        raise MediaNotFoundException()
    return media

async def fetch_user_medias(session: db_session, owner_id: int):
    result = await session.exec(select(Media).where(Media.owner_id == owner_id))
    medias = result.all()
    return medias

async def update_media(session: db_session, media_update: MediaUpdate, media_id: int, owner_id: int):
    result = await session.exec(select(Media).where(Media.id == media_id, Media.owner_id == owner_id))
    db_media = result.one_or_none()
    if not db_media:
        raise MediaNotFoundException()

    update_data = media_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_media, key, value)

    session.add(db_media)
    await session.commit()
    await session.refresh(db_media)
    return db_media

async def delete_media(session: db_session, media_id: int, owner_id: int):
    result = await session.exec(select(Media).where(Media.id == media_id, Media.owner_id == owner_id))
    db_media = result.one_or_none()
    if not db_media:
        raise MediaNotFoundException()

    await session.delete(db_media)
    await session.commit()
    return None

async def fetch_link_metadata(url: str):
    """Pobiera tytuł i miniaturkę (Open Graph) z zewnętrznego linku."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            title = soup.find("meta", property="og:title")
            image = soup.find("meta", property="og:image")
            
            return {
                "title": title["content"] if title else soup.title.string if soup.title else url,
                "thumbnail_url": image["content"] if image else None
            }
    except Exception:
        return None
