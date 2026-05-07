import { NextResponse } from "next/server";
import { callML, useDemoMode } from "@/lib/ml-client";
import { DEMO_SCORE } from "@/lib/demo-fixtures";
import type { ScoreRequest, ScoreResponse } from "@/types/api";

export async function POST(req: Request) {
  const body = (await req.json()) as ScoreRequest;

  if (useDemoMode) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json(DEMO_SCORE);
  }

  try {
    const r = await callML<ScoreResponse>("/score", body);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: "ml_failed" }, { status: 502 });
  }
}
