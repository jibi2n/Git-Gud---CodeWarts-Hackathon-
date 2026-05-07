"""Boses FastAPI ML service.

This service exposes the ML and data-pipeline endpoints consumed by the
Next.js client (via Next.js API route handlers — see DESIGN.md §4.1).

Routes (per docs/system-overview.md):
    POST /transcribe   audio URL  -> transcript                  [Role 2]
    POST /extract      transcript -> competencies                [Role 1 & 4]
    POST /vision       image URL  -> inferred competencies       [Role 2]
    POST /score        competencies -> readiness + job archetypes [Role 2]

All external-AI calls happen behind this service. The frontend never calls
OpenAI / Anthropic / Whisper / vision providers directly (AGENTS.md §6,
DESIGN.md §11.3).
"""
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Boses ML Service", version="0.1.0")


# --- Shared types (mirror docs/system-overview.md) ---------------------------

class Competency(BaseModel):
    id: str
    taglish_label: str
    english_label: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_span: str | None = None  # quote from transcript or OCR text


# --- Health ------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    version: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", version=app.version)


# --- /transcribe  (Role 2) ---------------------------------------------------

class TranscribeRequest(BaseModel):
    audio_url: str
    session_id: str


class TranscribeResponse(BaseModel):
    transcript: str
    duration_sec: float | None = None


@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(req: TranscribeRequest) -> TranscribeResponse:
    """Stub. Role 2: implement Whisper integration + 24h raw-audio deletion."""
    return TranscribeResponse(transcript="", duration_sec=None)


# --- /extract  (Role 1 & 4) --------------------------------------------------

class ExtractRequest(BaseModel):
    transcript: str
    session_id: str


class ExtractResponse(BaseModel):
    competencies: list[Competency]


@app.post("/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest) -> ExtractResponse:
    """Stub. Role 1 & 4: implement using XLM-RoBERTa + LLM rephrasing.

    Prompts live in apps/service/prompts/ — never inline.
    """
    return ExtractResponse(competencies=[])


# --- /vision  (Role 2) -------------------------------------------------------

class VisionRequest(BaseModel):
    image_url: str
    session_id: str


class VisionResponse(BaseModel):
    inferred_competencies: list[Competency]
    raw_text: str | None = None


@app.post("/vision", response_model=VisionResponse)
def vision(req: VisionRequest) -> VisionResponse:
    """Stub. Role 2: OCR via the declared vision provider; image bytes
    are deleted after extraction.
    """
    return VisionResponse(inferred_competencies=[], raw_text=None)


# --- /score  (Role 2) --------------------------------------------------------

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
    """Stub. Role 2: rule-based scorer for the configured TESDA track."""
    return ScoreResponse(
        readiness=ReadinessScore(
            track_id="",
            score=0.0,
            matched_competencies=[],
            missing_competencies=[],
            reasoning="",
        ),
        job_suggestions=[],
    )
