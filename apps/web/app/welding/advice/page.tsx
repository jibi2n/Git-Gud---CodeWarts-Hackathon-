"use client";

import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeldingAdviceData } from "@/lib/welding-demo-data";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "loaded" | "error";

export default function WeldingAdvicePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<WeldingAdviceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setState("loading");
        const r = await fetch("/api/welding/advice");
        if (!r.ok) throw new Error(`advice ${r.status}`);
        const d = (await r.json()) as WeldingAdviceData;
        if (!cancelled) {
          setData(d);
          setState("loaded");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setError("Something went wrong. Please try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!data) return null;
    if (!query) return data;

    const match = (s: string) => s.toLowerCase().includes(query);

    return {
      ...data,
      certifications: data.certifications.filter(
        (c) => match(c.name) || match(c.issuer) || match(c.summary)
      ),
      trainingPrograms: data.trainingPrograms.filter(
        (t) => match(t.name) || match(t.location) || match(t.summary)
      ),
    };
  }, [data, query]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          Career Advice
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          Welding-only demo portal (certifications, training, business ideas).
        </p>
      </header>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
            placeholder="Search certifications or training…"
          />
          <div className="text-[13px] text-fg-muted">
            Search applies to certifications and training lists.
          </div>
        </CardContent>
      </Card>

      {state === "error" && error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-danger-emphasis bg-danger-subtle px-4 py-3 text-[16px] text-danger-fg"
        >
          {error}
        </div>
      )}

      {state === "loaded" && filtered && (
        <div className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent className="text-[16px] text-fg-muted">
              {filtered.note}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {filtered.jobPaths.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-3">
                  <div className="text-[16px] font-medium">{p.title}</div>
                  <div className="mt-1 text-[14px] text-fg-muted">
                    Salary: {p.salaryRange}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.requirements.map((r) => (
                      <Badge key={r} variant="outline">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certifications (AWS / API / ASME / TESDA)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {filtered.certifications.map((c) => (
                <div key={c.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[16px] font-medium">{c.name}</div>
                    <Badge variant="secondary">{c.issuer}</Badge>
                  </div>
                  <div className="mt-1 text-[14px] text-fg-muted">{c.summary}</div>
                  <div className="mt-3">
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
              {filtered.certifications.length === 0 && (
                <div className="text-[14px] text-fg-muted">No matches.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {filtered.trainingPrograms.map((t) => (
                <div key={t.id} className="rounded-md border border-border p-3">
                  <div className="text-[16px] font-medium">{t.name}</div>
                  <div className="mt-1 text-[14px] text-fg-muted">
                    {t.location}
                  </div>
                  <div className="mt-1 text-[14px] text-fg-muted">{t.summary}</div>
                  <div className="mt-3">
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
              {filtered.trainingPrograms.length === 0 && (
                <div className="text-[14px] text-fg-muted">No matches.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Startup Ideas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {filtered.businessIdeas.map((b) => (
                <div key={b.id} className="rounded-md border border-border p-3">
                  <div className="text-[16px] font-medium">{b.name}</div>
                  <div className="mt-1 text-[14px] text-fg-muted">{b.summary}</div>
                  <div className="mt-3 text-[14px] font-medium">Market notes</div>
                  <ul className="mt-1 list-disc pl-5 text-[14px] text-fg-muted">
                    {b.marketNotes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-[14px] font-medium">Implementation steps</div>
                  <ol className="mt-1 list-decimal pl-5 text-[14px] text-fg-muted">
                    {b.steps.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
