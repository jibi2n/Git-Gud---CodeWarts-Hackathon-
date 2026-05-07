import { NextResponse } from "next/server";
import { callML, useDemoMode } from "@/lib/ml-client";
import { DEMO_EXTRACT } from "@/lib/demo-fixtures";
import type { ExtractRequest, ExtractResponse } from "@/types/api";

export async function POST(req: Request) {
  const body = (await req.json()) as ExtractRequest;

  if (useDemoMode) {
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json(DEMO_EXTRACT);
  }

  try {
    const r = await callML<ExtractResponse>("/extract", body);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: "ml_failed" }, { status: 502 });
  }
}
