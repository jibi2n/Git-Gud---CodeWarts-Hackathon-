// UI copy — all strings in English. No hardcoded strings in components — pull from here.

export const tl = {
  app: {
    name: "Boses",
    tagline: "Your voice, your readiness.",
  },

  landing: {
    headline: "Tell us your story.",
    sub: "We'll surface your skills and your next step.",
    consentVoiceTitle: "Voice consent",
    consentVoiceBody:
      "You are giving us permission to record and process your voice. We will not sell or share it with anyone.",
    consentImageTitle: "Photo consent",
    consentImageBody:
      "Do you permit us to photograph your documents? We will store them securely.",
    cta: "Get started",
    ctaDisabled: "Please check both boxes to continue",
  },

  record: {
    headline: "Record your story",
    sub: "Tell us about your work and experience. Up to 3 minutes.",
    cta: "Record",
    ctaProcessing: "Processing…",
    skip: "Use demo (no real recording)",
  },

  processing: {
    headline: "Boses is processing…",
    transcribe: "Transcribing your voice",
    extract: "Finding your skills",
    score: "Checking your TESDA readiness",
  },

  profile: {
    headline: "Your skills",
    aiBadge: "AI-detected — please review",
    confirm: "This is correct",
    reject: "Remove",
    readinessTitle: "TESDA Readiness",
    jobsTitle: "Job opportunities",
    pdfCta: "Download PDF",
    disclaimer:
      "This score is a guide only, not a guarantee. Please consult TESDA for an official assessment.",
  },

  errors: {
    generic: "Something went wrong. Please try again.",
    network: "No connection. Please try again.",
  },

  footer: {
    deleteData: "Delete my data",
    help: "Help",
  },
};

export type Locale = typeof tl;
