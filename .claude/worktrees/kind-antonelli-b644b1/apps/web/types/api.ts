// Mirrors apps/service/main.py Pydantic models — see docs/system-overview.md §3.
// Keep this file and main.py in lockstep. A drift here is a bug.

export type Competency = {
  id: string;
  taglish_label: string;
  english_label: string;
  confidence: number; // [0, 1]
  evidence_span?: string | null;
};

export type TranscribeRequest = {
  audio_url: string;
  session_id: string;
};

export type TranscribeResponse = {
  transcript: string;
  duration_sec?: number | null;
};

export type ExtractRequest = {
  transcript: string;
  session_id: string;
};

export type ExtractResponse = {
  competencies: Competency[];
};

export type VisionRequest = {
  image_url: string;
  session_id: string;
};

export type VisionResponse = {
  inferred_competencies: Competency[];
  raw_text?: string | null;
};

export type ScoreRequest = {
  session_id: string;
  competencies: Competency[];
};

export type JobSuggestion = {
  archetype: string;
  reasoning: string;
};

export type ReadinessScore = {
  track_id: string;
  score: number; // [0, 100]
  matched_competencies: string[];
  missing_competencies: string[];
  reasoning: string;
};

export type ScoreResponse = {
  readiness: ReadinessScore;
  job_suggestions: JobSuggestion[];
};

// Frontend-only: the persisted profile shape returned by /api/profile/[sessionId].
export type Profile = {
  session_id: string;
  competencies: Competency[];
  readiness: ReadinessScore | null;
  job_suggestions: JobSuggestion[];
};
