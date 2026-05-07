// UI copy — all strings in English. No hardcoded strings in components — pull from here.

export const tl = {
  app: {
    name: "San.AI",
    tagline: "Your voice, your next step.",
  },

  landing: {
    headline: "Tell us your story.",
    sub: "We'll surface your skills and map your next move.",
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
    cta: "Start recording",
    stop: "Stop recording",
    ctaProcessing: "Processing…",
    skip: "Use demo instead",
    next: "Continue",
    uploading: "Uploading…",
  },

  documents: {
    headline: "Documents (optional)",
    sub: "Take a photo of any credential you have (barangay certificate, employer letter, etc.).",
    capture: "Capture",
    skip: "Skip",
    done: "Continue",
  },

  processing: {
    headline: "Analyzing your story…",
    transcribe: "Transcribing your voice",
    extract: "Identifying your skills",
    vision: "Reading your documents",
    score: "Calculating TESDA readiness",
  },

  profile: {
    headline: "Your skills",
    aiBadge: "AI-detected",
    confirm: "This is correct",
    reject: "Remove",
    restore: "Restore",
    stateConfirmed: "Confirmed",
    stateRejected: "Removed",
    readinessTitle: "TESDA Readiness",
    jobsTitle: "Job opportunities",
    pdfCta: "Download PDF profile",
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
