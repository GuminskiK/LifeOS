FROM python:3.12-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libffi-dev libssl-dev zlib1g-dev libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"



COPY common common
RUN cd common && pip install --no-cache-dir -e .

COPY social_media_agregator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN /opt/venv/bin/pip install --no-cache-dir yt-dlp

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv

# yt-dlp might need ffmpeg and requires networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo zlib1g ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN useradd -m appuser && chown -R appuser /app
RUN mkdir -p /app/storage && chown -R appuser:appuser /app/storage
USER appuser

COPY --chown=appuser:appuser common common
COPY --chown=appuser:appuser social_media_agregator/app app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
