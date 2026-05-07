// UI copy — all strings in English. No hardcoded strings in components — pull from here.

export const tl = {
  app: {
    name: "sana.AI",
    tagline: "Your story holds skills the system hasn't recognized yet.",
    sub: "Speak in Tagalog, English, or Taglish — we'll surface your competencies, match them to TESDA certifications, and build your professional profile.",
  },

  landing: {
    headline: "Recognizing your kasanayans and the doors they open.",
    sub: "Tagalog, English, or Taglish. Just tell your story and we'll take care of the rest.",
    consentVoiceTitle: "I allow voice recording",
    consentVoiceBody:
      "Your voice is processed to identify your skills. It is never sold or shared with anyone.",
    consentImageTitle: "I allow document scanning",
    consentImageBody:
      "Photos of your credentials are read once to detect skills, then deleted. We don't store them.",
    cta: "Get started",
    ctaDisabled: "Please accept both to continue",
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
    pdfCta: "Download Report",
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
