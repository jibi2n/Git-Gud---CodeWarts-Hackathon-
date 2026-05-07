import os
import time
from pathlib import Path
from openai import OpenAI
import httpx

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI()
        self.temp_dir = Path("temp_audio")

        self.temp_dir.mkdir(parents=True, exist_ok=True)

    async def transcribe(self, audio_url: str) -> str:
        # 1. Download the file from Supabase URL
        file_id = int(time.time())
        local_filename = f"{self.temp_dir}/download_{file_id}.webm"
        async with httpx.AsyncClient() as client:
            resp = await client.get(audio_url)

            with open(local_filename, "wb") as f:
                f.write(resp.content)

        # 2. Transcribe the local copy
        with open(local_filename, "rb") as audio:
            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                prompt="Taglish conversation about work skills."
            )
        
        # 3. Cleanup local copy immediately
        os.remove(local_filename)
        return response.text
        

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
