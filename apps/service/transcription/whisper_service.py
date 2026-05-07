import os
import time
from openai import OpenAI

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI()
        self.temp_dir = "temp_audio"

    async def transcribe(self, audio_url: str) -> str:
        # 1. Download the file from Supabase URL
        local_filename = f"{self.temp_dir}/download_{int(time.time())}.webm"
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

    def enforce_deletion_policy(self):
        """Cron-ready logic to delete files older than 24 hours."""
        now = time.time()
        for f in os.listdir(self.temp_dir):
            f_path = os.path.join(self.temp_dir, f)
            if os.stat(f_path).st_mtime < now - (24 * 3600):
                os.remove(f_path)
