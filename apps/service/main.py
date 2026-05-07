from __future__ import annotations
import json
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, BackgroundTasks
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from transcription.whisper_service import TranscriptionService
from vision.vision_service import VisionService
from pathways.scorer import PathwayScorer

app = FastAPI(title="Boses ML Service", version="0.1.0")

transcriber = TranscriptionService()
vision_engine = VisionService()
scorer_engine = PathwayScorer()
openai_client = AsyncOpenAI()

# --- Shared types -----------------------------------------------------------

class Competency(BaseModel):
    id: str
    taglish_label: str
    english_label: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_span: str | None = None

# --- /health ----------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

# --- /transcribe (Role 2) ---------------------------------------------------

class TranscribeRequest(BaseModel):
    audio_url: str
    session_id: str

class TranscribeResponse(BaseModel):
    transcript: str
    duration_sec: float | None = None

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(req: TranscribeRequest, background_tasks: BackgroundTasks) -> TranscribeResponse:
    text = await transcriber.transcribe(req.audio_url)
    background_tasks.add_task(transcriber.enforce_deletion_policy)
    return TranscribeResponse(transcript=text, duration_sec=None)

# --- /extract (stub — Role 1 & 4 to replace with XLM-RoBERTa pipeline) ------

_EXTRACT_PROMPT = """You are a skills analyst who understands Filipino, Taglish, and English.
Given a Filipino/Taglish worker's story, identify their skills and competencies.

Rules:
1. Only extract skills actually mentioned — no inflation.
2. taglish_label: 3-8 words in the speaker's natural register.
3. english_label: 3-8 formal English words suitable for a resume.
4. confidence: 0.0-1.0 based on how clearly the skill is evidenced.
5. evidence_span: short verbatim quote from the transcript.
6. Return only valid JSON.

Transcript:
{transcript}

Return JSON:
{{"competencies": [{{"taglish_label": "...", "english_label": "...", "confidence": 0.0, "evidence_span": "..."}}]}}"""

class ExtractRequest(BaseModel):
    transcript: str
    session_id: str

class ExtractResponse(BaseModel):
    competencies: list[Competency]

@app.post("/extract", response_model=ExtractResponse)
async def extract(req: ExtractRequest) -> ExtractResponse:
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _EXTRACT_PROMPT.format(transcript=req.transcript)}],
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content or "{}")
        competencies = [
            Competency(
                id=f"c_{i + 1:03d}",
                taglish_label=c.get("taglish_label", ""),
                english_label=c.get("english_label", ""),
                confidence=float(c.get("confidence", 0.5)),
                evidence_span=c.get("evidence_span"),
            )
            for i, c in enumerate(data.get("competencies", []))
        ]
        return ExtractResponse(competencies=competencies)
    except Exception:
        return ExtractResponse(competencies=[])

# --- /vision (Role 2) -------------------------------------------------------

class VisionRequest(BaseModel):
    image_url: str
    session_id: str

class VisionResponse(BaseModel):
    inferred_competencies: list[Competency]
    raw_text: str | None = None

@app.post("/vision", response_model=VisionResponse)
async def vision(req: VisionRequest) -> VisionResponse:
    result = await vision_engine.analyze_credential(req.image_url)
    inferred = [
        Competency(
            id=f"v_{i + 1:03d}",
            taglish_label=c.get("taglish_label", c.get("english_label", "")),
            english_label=c.get("english_label", ""),
            confidence=float(c.get("confidence", 0.7)),
            evidence_span=c.get("evidence_span"),
        )
        for i, c in enumerate(result.get("competencies", []))
    ]
    return VisionResponse(
        inferred_competencies=inferred,
        raw_text=result.get("raw_text"),
    )

# --- /score (Role 2) --------------------------------------------------------

class ScoreRequest(BaseModel):
    session_id: str
    competencies: list[Competency]

class JobSuggestion(BaseModel):
    archetype: str
    reasoning: str

class ReadinessScore(BaseModel):
    track_id: str
    score: float = Field(ge=0.0, le=100.0)
    matched_competencies: list[str]
    missing_competencies: list[str]
    reasoning: str

class ScoreResponse(BaseModel):
    readiness: ReadinessScore
    job_suggestions: list[JobSuggestion]

@app.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest) -> ScoreResponse:
    return scorer_engine.generate_score_report(req.competencies)
