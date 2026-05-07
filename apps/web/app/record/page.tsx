"use client";

// STUB recorder for the demo flow. The real <VoiceRecorder> per DESIGN.md §5.3
// uses MediaRecorder + Supabase Storage upload — Role 3 implements that.
// This page exists so the end-to-end demo flow is walkable today.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { BigButton } from "@/components/shared/BigButton";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";

export default function RecordPage() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const [submitting, setSubmitting] = useState(false);

  async function startDemoFlow() {
    if (!sessionId) {
      router.push("/");
      return;
    }
    setSubmitting(true);
    // The processing screen will call /api/transcribe -> /api/extract -> /api/score.
    // The demo path uses a fake audio URL since no real recording happened.
    router.push(`/processing?audio=demo://taglish-sample-1`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-10">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          {tl.record.headline}
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          {tl.record.sub}
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <button
          aria-label={tl.record.cta}
          disabled={submitting}
          onClick={startDemoFlow}
          className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-accent-emphasis bg-accent-subtle text-accent-fg transition-colors hover:bg-accent-emphasis hover:text-fg-onEmphasis disabled:opacity-50"
        >
          <Mic size={56} strokeWidth={1.75} />
        </button>
        <p className="text-center text-[16px] text-fg-muted">
          {submitting ? tl.record.ctaProcessing : tl.record.cta}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <BigButton variant="secondary" onClick={startDemoFlow} disabled={submitting}>
          {tl.record.skip}
        </BigButton>
      </div>
    </main>
  );
}
