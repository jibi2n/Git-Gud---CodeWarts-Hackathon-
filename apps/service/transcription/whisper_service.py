import os
import time
from pathlib import Path

import httpx

class TranscriptionService:
    def __init__(self):
        from openai import OpenAI

        timeout_sec = float(os.getenv("WHISPER_TIMEOUT_SEC", "180"))
        self.client = OpenAI(timeout=timeout_sec, max_retries=2)
        self.temp_dir = Path("temp_audio")

        self.temp_dir.mkdir(parents=True, exist_ok=True)

    async def transcribe(self, audio_url: str) -> str:
        file_id = int(time.time())
        local_path = self.temp_dir / f"download_{file_id}.webm"

        download_timeout = httpx.Timeout(
            connect=float(os.getenv("AUDIO_DOWNLOAD_CONNECT_TIMEOUT_SEC", "10")),
            read=float(os.getenv("AUDIO_DOWNLOAD_READ_TIMEOUT_SEC", "120")),
            write=float(os.getenv("AUDIO_DOWNLOAD_WRITE_TIMEOUT_SEC", "30")),
            pool=float(os.getenv("AUDIO_DOWNLOAD_POOL_TIMEOUT_SEC", "10")),
        )

        try:
            async with httpx.AsyncClient(timeout=download_timeout, follow_redirects=True) as client:
                async with client.stream("GET", audio_url) as resp:
                    resp.raise_for_status()
                    with open(local_path, "wb") as f:
                        async for chunk in resp.aiter_bytes():
                            f.write(chunk)

            with open(local_path, "rb") as audio:
                response = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    prompt="Taglish conversation about work skills.",
                )

            return response.text
        finally:
            try:
                local_path.unlink(missing_ok=True)
            except Exception:
                pass
        

    def enforce_deletion_policy(self):
        """Cron-ready logic to delete files older than 24 hours."""
        now = time.time()
        for p in self.temp_dir.iterdir():
            try:
                if p.is_file() and p.stat().st_mtime < now - (24 * 3600):
                    p.unlink(missing_ok=True)
            except Exception:
                pass
