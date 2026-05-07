from __future__ import annotations
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field

# Internal Service Imports
from apps.service.transcription.whisper_service import TranscriptionService
from apps.service.extraction.extractor_service import ExtractorService
from apps.service.vision.vision_service import VisionService
from apps.service.pathways.scorer import PathwayScorer

app = FastAPI(title="Boses ML Service", version="0.1.0")

# Instantiate Services
transcriber = TranscriptionService()
extraction_engine = ExtractorService()
vision_engine = VisionService()
scorer_engine = PathwayScorer()

@app.get("/health")
def health():
    return {"status": "ok"}

# --- Shared types -----------------------------------------------------------

class Competency(BaseModel):
    id: str
    taglish_label: str
    english_label: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_span: str | None = None

# --- Existing /health and /extract (Role 1 & 4) kept as provided ---

# --- /transcribe (Role 2) ---------------------------------------------------

class TranscribeRequest(BaseModel):
    audio_url: str  # In production, this might be a local path or signed URL
    session_id: str

class TranscribeResponse(BaseModel):
    transcript: str
    duration_sec: float | None = None

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(req: TranscribeRequest, background_tasks: BackgroundTasks) -> TranscribeResponse:
    # 1. Integration: Call Whisper
    text = await transcriber.transcribe(req.audio_url)
    
    # 2. Policy: Enforcement of 24h raw-audio deletion
    background_tasks.add_task(transcriber.enforce_deletion_policy)
    
    return TranscribeResponse(transcript=text, duration_sec=None)

class ExtractRequest(BaseModel):
    transcript: str
    session_id: str

class ExtractResponse(BaseModel):
    competencies: list[Competency]

@app.post("/extract", response_model=ExtractResponse)
async def extract(req: ExtractRequest) -> ExtractResponse:
    results = await extraction_engine.extract_from_text(req.transcript)
    comps = [
        Competency(
            id=str(r.get("id") or ""),
            taglish_label=str(r.get("taglish_label") or ""),
            english_label=str(r.get("english_label") or ""),
            confidence=float(r.get("confidence") or 0.0),
            evidence_span=(str(r.get("evidence_span")) if r.get("evidence_span") is not None else None),
        )
        for r in results
        if r.get("id") and r.get("taglish_label") and r.get("english_label")
    ]
    return ExtractResponse(competencies=comps)

# --- /vision (Role 2) -------------------------------------------------------

class VisionRequest(BaseModel):
    image_url: str
    session_id: str

class VisionResponse(BaseModel):
    inferred_competencies: list[Competency]
    raw_text: str | None = None

@app.post("/vision", response_model=VisionResponse)
async def vision(req: VisionRequest) -> VisionResponse:
    # Integration: OCR + Competency Mapping via Vision API
    result = await vision_engine.analyze_credential(req.image_url)
    return VisionResponse(
        inferred_competencies=result["competencies"], 
        raw_text=result["raw_text"]
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
    # Rule-based logic to map confirmed competencies to TESDA tracks
    return scorer_engine.generate_score_report(req.competencies)
