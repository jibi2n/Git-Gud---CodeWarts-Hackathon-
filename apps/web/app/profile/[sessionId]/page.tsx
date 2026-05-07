"use client";

import { useProfileStore } from "@/stores/profile-store";
import { useSessionStore } from "@/stores/session-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { tl } from "@/locales/tl";
import { BigButton } from "@/components/shared/BigButton";
import type { Competency } from "@/types/api";

export default function ProfilePage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const storeSessionId = useSessionStore((s) => s.sessionId);

  const transcript = useProfileStore((s) => s.transcript);
  const competencies = useProfileStore((s) => s.competencies);
  const rejectedIds = useProfileStore((s) => s.rejectedIds);
  const toggleReject = useProfileStore((s) => s.toggleReject);
  const readiness = useProfileStore((s) => s.readiness);
  const jobs = useProfileStore((s) => s.jobSuggestions);

  useEffect(() => {
    if (!storeSessionId || storeSessionId !== params.sessionId) {
      router.push("/");
    }
  }, [storeSessionId, params.sessionId, router]);

  if (!storeSessionId) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          {tl.profile.headline}
        </h1>
        {transcript && (
          <p className="mt-3 rounded-md border border-border-subtle bg-bg-subtle p-3 text-[14px] italic leading-relaxed text-fg-muted">
            “{transcript}”
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        {competencies.map((c) => (
          <CompetencyCard
            key={c.id}
            competency={c}
            rejected={rejectedIds.has(c.id)}
            onToggle={() => toggleReject(c.id)}
          />
        ))}
      </section>

      {readiness && (
        <section className="mt-10 rounded-md border border-border bg-bg-default p-5">
          <h2 className="text-[20px] font-semibold leading-tight">
            {tl.profile.readinessTitle}
          </h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[30px] font-semibold leading-none">
              {Math.round(readiness.score)}
            </span>
            <span className="text-[17px] text-fg-muted">/ 100</span>
          </div>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            {readiness.reasoning}
          </p>
          {readiness.matched_competencies.length > 0 && (
            <p className="mt-3 text-[14px] text-success-fg">
              <strong>Strengths:</strong>{" "}
              {readiness.matched_competencies.join(", ")}
            </p>
          )}
          {readiness.missing_competencies.length > 0 && (
            <p className="mt-2 text-[14px] text-attention-fg">
              <strong>Areas to develop:</strong>{" "}
              {readiness.missing_competencies.join(", ")}
            </p>
          )}
          <p className="mt-4 text-[13px] leading-relaxed text-fg-subtle">
            {tl.profile.disclaimer}
          </p>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[20px] font-semibold leading-tight">
            {tl.profile.jobsTitle}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {jobs.map((j, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-bg-default p-4"
              >
                <div className="text-[17px] font-medium">{j.archetype}</div>
                <p className="mt-1 text-[16px] leading-relaxed text-fg-muted">
                  {j.reasoning}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <BigButton variant="secondary" disabled>
          {tl.profile.pdfCta} (coming soon)
        </BigButton>
      </div>
    </main>
  );
}

function CompetencyCard({
  competency,
  rejected,
  onToggle,
}: {
  competency: Competency;
  rejected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`rounded-md border p-4 transition-colors ${
        rejected
          ? "border-border-muted bg-bg-subtle opacity-60"
          : "border-border bg-bg-default"
      }`}
    >
      <div className="mb-2 inline-block rounded bg-attention-subtle px-2 py-0.5 text-[13px] text-attention-fg">
        {tl.profile.aiBadge}
      </div>
      <div className="text-[17px] font-medium leading-tight">
        {competency.taglish_label}
      </div>
      <div className="text-[14px] text-fg-muted">{competency.english_label}</div>
      {competency.evidence_span && (
        <p className="mt-2 text-[14px] italic leading-relaxed text-fg-muted">
          “…{competency.evidence_span}…”
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onToggle}
          className={`min-h-[44px] flex-1 rounded-md border px-3 text-[14px] font-medium ${
            rejected
              ? "border-accent-emphasis bg-accent-subtle text-accent-fg"
              : "border-border bg-bg-default text-fg"
          }`}
          aria-pressed={rejected}
        >
          {rejected ? "Restore" : tl.profile.reject}
        </button>
      </div>
    </article>
  );
}
