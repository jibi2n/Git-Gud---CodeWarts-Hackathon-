import { NextResponse } from "next/server";
import { callML, useDemoMode } from "@/lib/ml-client";
import type { VisionRequest, VisionResponse } from "@/types/api";

export async function POST(req: Request) {
  const body = (await req.json()) as VisionRequest;

  if (useDemoMode) {
    await new Promise((r) => setTimeout(r, 600));
    const demo: VisionResponse = { inferred_competencies: [], raw_text: null };
    return NextResponse.json(demo);
  }

  try {
    const r = await callML<VisionResponse>("/vision", body);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: "ml_failed" }, { status: 502 });
  }
}

