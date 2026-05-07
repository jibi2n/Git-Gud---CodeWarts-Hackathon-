"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";
import { cn } from "@/lib/utils";

export function ConsentGate() {
  const router = useRouter();
  const consent = useSessionStore((s) => s.consent);
  const grantConsent = useSessionStore((s) => s.grantConsent);
  const setSession = useSessionStore((s) => s.setSession);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = consent.voice && consent.image;

  async function start() {
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          consent_voice: consent.voice,
          consent_image: consent.image,
        }),
      });
      if (!r.ok) throw new Error(`session ${r.status}`);
      const { sessionId } = (await r.json()) as { sessionId: string };
      setSession(sessionId, "");
      router.push("/record");
    } catch (e) {
      setError(tl.errors.generic);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ConsentToggle
        title={tl.landing.consentVoiceTitle}
        body={tl.landing.consentVoiceBody}
        checked={consent.voice}
        onChange={(v) => grantConsent("voice", v)}
      />
      <ConsentToggle
        title={tl.landing.consentImageTitle}
        body={tl.landing.consentImageBody}
        checked={consent.image}
        onChange={(v) => grantConsent("image", v)}
      />

      {error && (
        <div
          role="alert"
          className="rounded-md border border-danger-emphasis/50 bg-danger-subtle px-4 py-3 text-[15px] text-danger-fg"
        >
          {error}
        </div>
      )}

      <button
        className={cn(
          "mt-2 w-full min-h-[56px] rounded-md border text-[17px] font-semibold transition-all duration-200",
          ready && !submitting
            ? "border-green-600 bg-green-600 text-white hover:bg-green-500 hover:border-green-500 shadow-sm shadow-green-600/30"
            : "border-border bg-bg-subtle text-fg-subtle cursor-not-allowed opacity-50"
        )}
        onClick={start}
        disabled={!ready || submitting}
      >
        {submitting ? "Starting…" : ready ? tl.landing.cta : tl.landing.ctaDisabled}
      </button>
    </div>
  );
}

function ConsentToggle({
  title,
  body,
  checked,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-bg-default p-4 transition-all duration-200",
        checked
          ? "border-green-500/60 bg-green-950/20"
          : "border-border hover:border-border-muted"
      )}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={cn(
              "peer size-5 shrink-0 cursor-pointer appearance-none rounded border bg-bg-subtle transition-all duration-200",
              checked ? "border-green-500 bg-green-600" : "border-border"
            )}
            aria-describedby={`consent-body-${title.replace(/\s+/g, "-")}`}
          />
          {checked && (
            <svg
              className="pointer-events-none absolute size-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "text-[16px] font-semibold leading-tight transition-colors",
              checked ? "text-green-400" : "text-fg"
            )}
          >
            {title}
          </span>
          <p
            id={`consent-body-${title.replace(/\s+/g, "-")}`}
            className="text-[14px] leading-relaxed text-fg-muted"
          >
            {body}
          </p>
        </div>
      </label>
    </div>
  );
}
