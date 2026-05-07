"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { useProfileStore } from "@/stores/profile-store";
import { tl } from "@/locales/tl";
import type {
  ExtractResponse,
  ScoreResponse,
  TranscribeResponse,
} from "@/types/api";

type Step = "transcribe" | "extract" | "score" | "done" | "error";

function ProcessingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get("audio") ?? "demo://taglish-sample-1";

  const sessionId = useSessionStore((s) => s.sessionId);
  const setTranscript = useProfileStore((s) => s.setTranscript);
  const setCompetencies = useProfileStore((s) => s.setCompetencies);
  const setScore = useProfileStore((s) => s.setScore);

  const [step, setStep] = useState<Step>("transcribe");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setStep("transcribe");
        const t = (await postJson("/api/transcribe", {
          audio_url: audioUrl,
          session_id: sessionId,
        })) as TranscribeResponse;
        if (cancelled) return;
        setTranscript(t.transcript);

        setStep("extract");
        const e = (await postJson("/api/extract", {
          transcript: t.transcript,
          session_id: sessionId,
        })) as ExtractResponse;
        if (cancelled) return;
        setCompetencies(e.competencies);

        setStep("score");
        const s = (await postJson("/api/score", {
          session_id: sessionId,
          competencies: e.competencies,
        })) as ScoreResponse;
        if (cancelled) return;
        setScore(s.readiness, s.job_suggestions);

        setStep("done");
        router.push(`/profile/${sessionId}`);
      } catch (err) {
        if (!cancelled) {
          setStep("error");
          setError(tl.errors.generic);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl, sessionId, router, setTranscript, setCompetencies, setScore]);

  const items: Array<{ key: Step; label: string }> = [
    { key: "transcribe", label: tl.processing.transcribe },
    { key: "extract", label: tl.processing.extract },
    { key: "score", label: tl.processing.score },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-10">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          {tl.processing.headline}
        </h1>
      </header>

      <ol
        className="flex flex-col gap-3"
        role="status"
        aria-live="polite"
      >
        {items.map((it) => {
          const isActive = step === it.key;
          const isDone =
            items.findIndex((x) => x.key === step) >
            items.findIndex((x) => x.key === it.key);
          return (
            <li
              key={it.key}
              className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-default px-4 py-3"
            >
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[13px]"
                style={{
                  backgroundColor: isDone
                    ? "var(--success-subtle)"
                    : isActive
                    ? "var(--accent-subtle)"
                    : "transparent",
                  borderColor: isDone
                    ? "var(--success-emphasis)"
                    : isActive
                    ? "var(--accent-emphasis)"
                    : "var(--border-muted)",
                  color: isDone
                    ? "var(--success-fg)"
                    : isActive
                    ? "var(--accent-fg)"
                    : "var(--fg-subtle)",
                }}
              >
                {isDone ? "✓" : isActive ? "…" : ""}
              </span>
              <span
                className={`text-[17px] ${
                  isActive ? "text-fg" : isDone ? "text-fg-muted" : "text-fg-subtle"
                }`}
              >
                {it.label}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-danger-emphasis bg-danger-subtle px-4 py-3 text-[16px] text-danger-fg"
        >
          {error}
        </div>
      )}
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={null}>
      <ProcessingInner />
    </Suspense>
  );
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}
