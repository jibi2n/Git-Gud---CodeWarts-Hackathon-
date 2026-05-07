from openai import OpenAI
from pydantic import BaseModel

class ExtractorService:
    def __init__(self):
        self.client = OpenAI()

    async def extract_from_text(self, text: str) -> list:
        # If the transcript is empty, don't waste credits
        if not text.strip():
            return []

        prompt = f"""
        Extract professional competencies and technical skills from this Taglish transcript:
        "{text}"
        
        Return the result as a list of skills with Taglish and English labels. 
        Focus on vocational skills (e.g., Welding, Driving, Cooking).
        """
        
        # For a placeholder, we can just return a mock list or a simple LLM call
        # Mocking a response for the hackathon stability:
        return [
            {
                "id": "skill_1",
                "taglish_label": "Basic Welding",
                "english_label": "Basic Welding",
                "confidence": 0.5
            }
        ]
