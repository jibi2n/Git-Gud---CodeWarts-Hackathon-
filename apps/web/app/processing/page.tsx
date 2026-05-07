"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { useProfileStore } from "@/stores/profile-store";
import { useCaptureStore } from "@/stores/capture-store";
import { tl } from "@/locales/tl";
import type {
  Competency,
  ExtractResponse,
  ScoreResponse,
  TranscribeResponse,
  VisionResponse,
} from "@/types/api";

type Step = "transcribe" | "extract" | "vision" | "score" | "done" | "error";

function ProcessingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioFromStore = useCaptureStore((s) => s.audioUrl);
  const documents = useCaptureStore((s) => s.documents);
  const audioUrl =
    searchParams.get("audio") ?? audioFromStore ?? "demo://taglish-sample-1";

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
        let merged = e.competencies ?? [];

        const uploadedDocs = documents.filter(
          (d) => d.url && d.uploadStatus === "uploaded"
        );

        if (uploadedDocs.length > 0) {
          setStep("vision");
          const results = await Promise.all(
            uploadedDocs.map(async (d) => {
              const r = (await postJson("/api/vision", {
                image_url: d.url,
                session_id: sessionId,
              })) as VisionResponse;
              return r.inferred_competencies ?? [];
            })
          );
          const inferred = results.flat();
          merged = mergeCompetencies(e.competencies ?? [], inferred);
        }

        if (cancelled) return;
        setCompetencies(merged);

        setStep("score");
        const s = (await postJson("/api/score", {
          session_id: sessionId,
          competencies: merged,
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
  }, [
    audioUrl,
    sessionId,
    documents,
    router,
    setTranscript,
    setCompetencies,
    setScore,
  ]);

  const items: Array<{ key: Step; label: string }> = [
    { key: "transcribe", label: tl.processing.transcribe },
    { key: "extract", label: tl.processing.extract },
    ...(documents.some((d) => d.url && d.uploadStatus === "uploaded")
      ? [{ key: "vision" as const, label: tl.processing.vision }]
      : []),
    { key: "score", label: tl.processing.score },
  ];

  const currentIndex = items.findIndex((x) => x.key === step);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-10 animate-fade-up [animation-fill-mode:both]">
        <div className="mb-2 flex items-baseline gap-0.5">
          <span className="text-[28px] font-[800] leading-none tracking-tight text-fg">San</span>
          <span className="text-[28px] font-[800] leading-none tracking-tight text-accent-fg">.AI</span>
        </div>
        <h1 className="text-[22px] font-semibold leading-snug text-fg-muted">
          {tl.processing.headline}
        </h1>
      </header>

      <ol
        className="flex flex-col gap-3"
        role="status"
        aria-live="polite"
      >
        {items.map((it, i) => {
          const isActive = step === it.key;
          const isDone = currentIndex > i;
          return (
            <li
              key={it.key}
              className="flex items-center gap-4 rounded-md border border-border bg-bg-default px-4 py-3.5 animate-fade-up [animation-fill-mode:both] transition-colors"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? "var(--success-subtle)"
                    : isActive
                    ? "var(--accent-subtle)"
                    : "transparent",
                  borderWidth: "1.5px",
                  borderStyle: "solid",
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
                {isDone ? "✓" : isActive ? "·" : String(i + 1)}
              </span>
              <span
                className="text-[16px] font-medium transition-colors duration-300"
                style={{
                  color: isDone
                    ? "var(--fg-muted)"
                    : isActive
                    ? "var(--fg-default)"
                    : "var(--fg-subtle)",
                }}
              >
                {it.label}
              </span>
              {isActive && (
                <span className="ml-auto flex gap-0.5">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-accent-fg animate-pulse-dot"
                      style={{ animationDelay: `${n * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-danger-emphasis/50 bg-danger-subtle px-4 py-3 text-[15px] text-danger-fg"
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

function mergeCompetencies(base: Competency[], inferred: Competency[]) {
  const byKey = new Map<string, Competency>();

  const keyOf = (c: Competency) =>
    (c.english_label || c.taglish_label).trim().toLowerCase();

  for (const c of base) {
    byKey.set(keyOf(c), c);
  }
  for (const c of inferred) {
    const key = keyOf(c);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, c);
      continue;
    }
    if ((c.confidence ?? 0) > (existing.confidence ?? 0)) {
      byKey.set(key, { ...existing, ...c });
    }
  }

  return Array.from(byKey.values());
}
