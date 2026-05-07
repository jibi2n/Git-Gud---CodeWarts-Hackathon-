"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";
import { Button } from "@/components/ui/button";
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

      <Button
        size="lg"
        className="mt-2 w-full min-h-[56px] text-[17px]"
        onClick={start}
        disabled={!ready || submitting}
      >
        {submitting ? "Starting…" : ready ? tl.landing.cta : tl.landing.ctaDisabled}
      </Button>
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
          ? "border-accent-emphasis/60 bg-accent-subtle"
          : "border-border hover:border-border-muted"
      )}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer size-5 shrink-0 cursor-pointer appearance-none rounded border border-border bg-bg-subtle transition-colors checked:border-accent-emphasis checked:bg-accent-emphasis"
            aria-describedby={`consent-body-${title.replace(/\s+/g, "-")}`}
          />
          {checked && (
            <svg
              className="pointer-events-none absolute size-3 text-fg-onEmphasis"
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
          <span className="text-[16px] font-semibold leading-tight">{title}</span>
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
