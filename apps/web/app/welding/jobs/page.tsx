"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWeldingProfileStore } from "@/stores/welding-profile-store";
import type { WeldingJob } from "@/lib/welding-jobs";
import { WeldingMap } from "@/components/welding/WeldingMap";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LoadState = "idle" | "loading" | "loaded" | "error";

export default function WeldingJobsPage() {
  const profile = useWeldingProfileStore((s) => s.profile);
  const origin = useMemo(
    () =>
      profile.location
        ? { lat: profile.location.lat, lng: profile.location.lng }
        : null,
    [profile.location]
  );

  const [state, setState] = useState<LoadState>("idle");
  const [jobs, setJobs] = useState<WeldingJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? null,
    [jobs, selectedId]
  );

  const load = useCallback(async () => {
    if (!origin) return;
    setError(null);
    setState("loading");
    try {
      const r = await fetch("/api/welding/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin,
          radiusMiles: Math.min(50, Math.max(5, profile.radiusMiles)),
          seed: Math.floor(Date.now() / 1000),
        }),
      });
      if (!r.ok) throw new Error(`jobs ${r.status}`);
      const data = (await r.json()) as { jobs: WeldingJob[] };
      setJobs(data.jobs);
      setSelectedId(data.jobs[0]?.id ?? null);
      setState("loaded");
    } catch {
      setState("error");
      setError("Something went wrong. Please try again.");
    }
  }, [origin, profile.radiusMiles]);

  useEffect(() => {
    if (!origin) {
      setJobs([]);
      setSelectedId(null);
      setState("idle");
      return;
    }
    void load();
  }, [origin, load]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          Job Matcher
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          Synthetic welding jobs within ~50 miles of your profile location.
        </p>
      </header>

      {!origin ? (
        <Card>
          <CardHeader>
            <CardTitle>Set your location first</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-[16px] text-fg-muted">
              Go to your welding profile and pick a location preset to generate nearby jobs.
            </p>
              <Link
                href="/welding/profile"
                className={cn(
                  buttonVariants({ size: "lg", variant: "default" }),
                  "w-full min-h-[56px] text-[17px]"
                )}
              >
                Open profile
              </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <WeldingMap origin={origin} jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {state === "loading"
                ? "Loading…"
                : state === "loaded"
                ? `${jobs.length} jobs`
                : "No jobs"}
            </Badge>
            <Button variant="secondary" onClick={load} disabled={state === "loading"}>
              Refresh
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger-emphasis bg-danger-subtle px-4 py-3 text-[16px] text-danger-fg"
            >
              {error}
            </div>
          )}

          {selected && (
            <Card>
              <CardHeader className="gap-2">
                <CardTitle>{selected.title}</CardTitle>
                <div className="text-[14px] text-fg-muted">{selected.companyName}</div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-[16px]">
                  <span className="font-medium">
                    {selected.currency} {selected.salaryMin}–{selected.salaryMax}/hr
                  </span>{" "}
                  <span className="text-fg-muted">· {selected.distanceMiles} mi away</span>
                </div>
                <p className="text-[16px] text-fg-muted">{selected.companyAbout}</p>
                <div className="flex flex-wrap gap-2">
                  {selected.requirements.map((r) => (
                    <Badge key={r} variant="outline">
                      {r}
                    </Badge>
                  ))}
                </div>
                <a
                  href={selected.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "default" }),
                    "w-full min-h-[56px] text-[17px]"
                  )}
                >
                  Apply
                </a>
              </CardContent>
            </Card>
          )}

          <section className="flex flex-col gap-2">
            {jobs.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setSelectedId(j.id)}
                className={`rounded-md border p-3 text-left ${
                  j.id === selectedId ? "border-accent-emphasis bg-accent-subtle" : "border-border bg-bg-default"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[16px] font-medium">{j.title}</div>
                  <div className="text-[13px] text-fg-muted">{j.distanceMiles} mi</div>
                </div>
                <div className="text-[14px] text-fg-muted">{j.companyName}</div>
              </button>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
