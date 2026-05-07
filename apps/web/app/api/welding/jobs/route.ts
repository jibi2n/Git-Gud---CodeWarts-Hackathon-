import { NextResponse } from "next/server";
import { generateSyntheticWeldingJobs } from "@/lib/welding-jobs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    origin?: { lat: number; lng: number };
    radiusMiles?: number;
    seed?: number;
    count?: number;
  };

  const origin = body.origin;
  if (!origin || typeof origin.lat !== "number" || typeof origin.lng !== "number") {
    return NextResponse.json({ error: "bad_origin" }, { status: 400 });
  }

  const radiusMiles = Math.min(50, Math.max(5, Number(body.radiusMiles ?? 50)));
  const count = Math.min(20, Math.max(3, Number(body.count ?? 12)));
  const seed = Number(body.seed ?? Math.floor(Date.now() / 1000));

  const jobs = generateSyntheticWeldingJobs({ origin, radiusMiles, count, seed });
  return NextResponse.json({ jobs });
}

