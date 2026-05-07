import { NextResponse } from "next/server";
import { callML, useDemoMode } from "@/lib/ml-client";
import { DEMO_TRANSCRIPT } from "@/lib/demo-fixtures";
import type { TranscribeRequest, TranscribeResponse } from "@/types/api";

export async function POST(req: Request) {
  const body = (await req.json()) as TranscribeRequest;

  if (useDemoMode) {
    // Simulate the ~1-2s call so the processing UI has something to render.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(DEMO_TRANSCRIPT);
  }

  try {
    const r = await callML<TranscribeResponse>("/transcribe", body);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: "ml_failed" }, { status: 502 });
  }
}
