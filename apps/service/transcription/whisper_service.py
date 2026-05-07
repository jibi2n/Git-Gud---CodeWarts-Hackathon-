import os
import time
import tempfile
import httpx
from openai import AsyncOpenAI


class TranscriptionService:
    def __init__(self):
        self.client = AsyncOpenAI()

    async def transcribe(self, audio_url: str) -> str:
        async with httpx.AsyncClient(timeout=60) as http:
            resp = await http.get(audio_url)
            resp.raise_for_status()

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(resp.content)
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as audio:
                response = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    prompt="Taglish conversation about work skills.",
                )
            return response.text
        finally:
            os.unlink(tmp_path)

    def enforce_deletion_policy(self) -> None:
        pass
