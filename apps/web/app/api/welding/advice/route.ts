import { NextResponse } from "next/server";
import { WELDING_ADVICE_DATA } from "@/lib/welding-demo-data";

export async function GET() {
  return NextResponse.json(WELDING_ADVICE_DATA);
}

