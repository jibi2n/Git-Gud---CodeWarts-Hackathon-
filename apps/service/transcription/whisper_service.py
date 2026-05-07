import os
import time
from openai import OpenAI

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI()
        self.temp_dir = "temp_audio"

    async def transcribe(self, audio_path: str) -> str:
        # Handles Taglish nuances via prompt engineering
        with open(audio_path, "rb") as audio:
            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                prompt="The speaker uses Filipino, Taglish, and English interchangeably."
            )
            return response.text

    def enforce_deletion_policy(self):
        """Cron-ready logic to delete files older than 24 hours."""
        now = time.time()
        for f in os.listdir(self.temp_dir):
            f_path = os.path.join(self.temp_dir, f)
            if os.stat(f_path).st_mtime < now - (24 * 3600):
                os.remove(f_path)