"use client";

// Two consent toggles per DESIGN.md §11.1. Both must be ON to proceed.
// Each is paired with a plain-Tagalog explanation surfaced via <details>
// rather than a modal, since modals are forbidden for primary flows
// (DESIGN.md §7 anti-patterns).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";
import { BigButton } from "@/components/shared/BigButton";
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
    <div className="flex flex-col gap-6">
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
          className="rounded-md border border-danger-emphasis bg-danger-subtle px-4 py-3 text-[16px] text-danger-fg"
        >
          {error}
        </div>
      )}

      <BigButton onClick={start} disabled={!ready || submitting}>
        {submitting ? "…" : ready ? tl.landing.cta : tl.landing.ctaDisabled}
      </BigButton>
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
        "rounded-md border bg-bg-default p-4 transition-colors",
        checked
          ? "border-accent-emphasis bg-accent-subtle"
          : "border-border"
      )}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-accent-emphasis"
          aria-describedby={`consent-body-${title.replace(/\s+/g, "-")}`}
        />
        <div className="flex flex-col gap-1">
          <span className="text-[17px] font-medium leading-tight">
            {title}
          </span>
          <p
            id={`consent-body-${title.replace(/\s+/g, "-")}`}
            className="text-[16px] leading-relaxed text-fg-muted"
          >
            {body}
          </p>
        </div>
      </label>
    </div>
  );
}
