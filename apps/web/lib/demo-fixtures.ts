// Fake data for the demo flow when ML_SERVICE_URL is not configured.
// Used by /api/transcribe, /api/extract, /api/score so the UI can be walked
// end-to-end before any real ML is wired (DESIGN.md §17 Phase 5 backup plan).

import type {
  Competency,
  ExtractResponse,
  JobSuggestion,
  ReadinessScore,
  ScoreResponse,
  TranscribeResponse,
} from "@/types/api";

export const DEMO_TRANSCRIPT: TranscribeResponse = {
  transcript:
    "Mga limang taon na akong nagmamaneho ng tricycle dito sa amin. Pero pag may sira, ako rin yung nagaayos ng makina. Marunong din ako mag-weld kahit konti, dahil natutong ako sa kapatid ko na mekaniko. Tapos pag may pasahero, ako rin yung nagcoordinate sa ibang drayber para sa schedule.",
  duration_sec: 47.0,
};

const DEMO_COMPETENCIES: Competency[] = [
  {
    id: "c_001",
    taglish_label: "Pag-aayos ng makina ng motor",
    english_label: "Small engine repair",
    confidence: 0.84,
    evidence_span: "ako rin yung nagaayos ng makina",
  },
  {
    id: "c_002",
    taglish_label: "Basic na welding",
    english_label: "Basic welding fundamentals",
    confidence: 0.72,
    evidence_span: "Marunong din ako mag-weld kahit konti",
  },
  {
    id: "c_003",
    taglish_label: "Pag-aasikaso ng schedule ng mga drayber",
    english_label: "Driver dispatch coordination",
    confidence: 0.78,
    evidence_span: "ako rin yung nagcoordinate sa ibang drayber para sa schedule",
  },
  {
    id: "c_004",
    taglish_label: "Karanasan sa pagmamaneho",
    english_label: "Professional driving experience",
    confidence: 0.91,
    evidence_span: "limang taon na akong nagmamaneho ng tricycle",
  },
];

export const DEMO_EXTRACT: ExtractResponse = {
  competencies: DEMO_COMPETENCIES,
};

const DEMO_READINESS: ReadinessScore = {
  track_id: "tesda_welder_nc_ii",
  score: 58.0,
  matched_competencies: ["Small engine repair", "Basic welding fundamentals"],
  missing_competencies: [
    "Arc welding processes (SMAW)",
    "Welding safety standards",
    "Blueprint reading",
  ],
  reasoning:
    "You have solid mechanical aptitude and real exposure to welding. To pass Welder NC II, you still need to formalize your welding-process knowledge and complete safety training.",
};

const DEMO_JOBS: JobSuggestion[] = [
  {
    archetype: "Apprentice welder",
    reasoning:
      "Your welding experience, even at a basic level, is enough to qualify for an entry-level apprentice role where you can learn formal techniques on the job.",
  },
  {
    archetype: "Motorcycle mechanic",
    reasoning:
      "Your engine repair skills translate directly to a formal motorcycle shop. Many SME shops in NCR are actively hiring.",
  },
  {
    archetype: "Dispatch coordinator (transport)",
    reasoning:
      "Your experience coordinating driver schedules is directly valuable to logistics and transport companies.",
  },
];

export const DEMO_SCORE: ScoreResponse = {
  readiness: DEMO_READINESS,
  job_suggestions: DEMO_JOBS,
};
