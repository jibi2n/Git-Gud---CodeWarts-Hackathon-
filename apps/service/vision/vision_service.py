import os

from openai import OpenAI

class VisionService:
    def __init__(self):
        pass

    async def analyze_credential(self, image_url: str):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {"competencies": [], "raw_text": None}

        client = OpenAI(api_key=api_key)
        _ = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": f"Extract credential text from this image URL: {image_url}",
                }
            ],
        )
        return {"competencies": [], "raw_text": None}
