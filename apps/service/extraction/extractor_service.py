import os
import re

from openai import OpenAI

class ExtractorService:
    def __init__(self):
        self.client = None

    def _keyword_fallback(self, text: str) -> list[dict]:
        t = (text or "").lower()

        has_welding = bool(re.search(r"\bweld|welding|nagwe-weld|mag-weld|welder\b", t))
        if not has_welding:
            return []

        out: list[dict] = []

        out.append(
            {
                "id": "w-01",
                "taglish_label": "Basic welding",
                "english_label": "Basic welding",
                "confidence": 0.6,
                "evidence_span": None,
            }
        )

        if "ppe" in t or "safety" in t or "mask" in t:
            out.append(
                {
                    "id": "w-02",
                    "taglish_label": "Safety practices / PPE",
                    "english_label": "Safety practices / PPE",
                    "confidence": 0.6,
                    "evidence_span": None,
                }
            )

        if any(k in t for k in ["blueprint", "drawing", "drawings", "sketch", "interpret"]):
            out.append(
                {
                    "id": "w-03",
                    "taglish_label": "Pagbasa ng drawings",
                    "english_label": "Reading drawings/blueprints",
                    "confidence": 0.55,
                    "evidence_span": None,
                }
            )

        if any(k in t for k in ["prepare", "materials", "tools", "setup"]):
            out.append(
                {
                    "id": "w-04",
                    "taglish_label": "Paghahanda ng materyales",
                    "english_label": "Materials and tool preparation",
                    "confidence": 0.55,
                    "evidence_span": None,
                }
            )

        return out

    async def extract_from_text(self, text: str) -> list:
        if not text.strip():
            return []

        if os.getenv("BOSE_DISABLE_TRANSFORMERS") == "1":
            return self._keyword_fallback(text)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return self._keyword_fallback(text)

        client = OpenAI(api_key=api_key)
        _ = client
        return self._keyword_fallback(text)
