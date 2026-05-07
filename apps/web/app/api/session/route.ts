import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

// POST /api/session — creates a new session.
// Stub: returns a fresh sessionId. The real implementation persists to Supabase
// (sessions + audit_log per docs/system-overview.md §4) and validates consent.

export async function POST(req: Request) {
  let consent_voice = false;
  let consent_image = false;
  try {
    const body = (await req.json()) as {
      consent_voice?: boolean;
      consent_image?: boolean;
    };
    consent_voice = !!body.consent_voice;
    consent_image = !!body.consent_image;
  } catch {
    // empty body is OK in demo mode
  }

  if (!consent_voice || !consent_image) {
    return NextResponse.json(
      { error: "consent_required" },
      { status: 400 }
    );
  }

  const sessionId = `ses_${randomUUID().slice(0, 8)}`;
  return NextResponse.json({ sessionId, createdAt: new Date().toISOString() });
}
