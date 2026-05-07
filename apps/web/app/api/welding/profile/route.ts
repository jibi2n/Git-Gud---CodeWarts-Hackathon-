import { NextResponse } from "next/server";

const DEFAULT = {
  fullName: "",
  phone: "",
  email: "",
  bio: "",
  location: null,
  radiusMiles: 50,
  skills: [] as string[],
  specializations: [] as string[],
  isPublic: false,
  photoDataUrl: null,
};

export async function GET() {
  return NextResponse.json(DEFAULT);
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<typeof DEFAULT>;
  const sanitized = {
    ...DEFAULT,
    ...body,
    radiusMiles: Math.min(50, Math.max(5, Number(body.radiusMiles ?? 50))),
    skills: Array.isArray(body.skills) ? body.skills.filter((x) => typeof x === "string") : [],
    specializations: Array.isArray(body.specializations)
      ? body.specializations.filter((x) => typeof x === "string")
      : [],
  };
  return NextResponse.json(sanitized);
}

