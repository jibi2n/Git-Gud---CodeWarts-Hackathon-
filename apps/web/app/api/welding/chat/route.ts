import { NextResponse } from "next/server";
import { callML, useDemoMode } from "@/lib/ml-client";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: ChatMessage[];
    profile?: unknown;
  };

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m?.role === "user")?.content ?? "";

  if (useDemoMode) {
    const reply =
      "Demo mode: I can help with welding certifications (AWS/API/ASME), job prep, and suggested next steps. Ask a specific question like “What cert should I get for pipeline welding?”";
    return NextResponse.json({ reply: lastUser ? reply : "Ask me a welding question." });
  }

  try {
    const r = await callML<{ reply: string }>("/chat", {
      messages,
      profile: body.profile ?? null,
    });
    return NextResponse.json(r);
  } catch {
    return NextResponse.json({ error: "ml_failed" }, { status: 502 });
  }
}

