"use client";

import { useProfileStore } from "@/stores/profile-store";
import { useSessionStore } from "@/stores/session-store";
import { useCaptureStore } from "@/stores/capture-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tl } from "@/locales/tl";
import type { Competency } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const storeSessionId = useSessionStore((s) => s.sessionId);
  const resetSession = useSessionStore((s) => s.reset);
  const resetProfile = useProfileStore((s) => s.reset);
  const resetCapture = useCaptureStore((s) => s.reset);

  const transcript = useProfileStore((s) => s.transcript);
  const competencies = useProfileStore((s) => s.competencies);
  const rejectedIds = useProfileStore((s) => s.rejectedIds);
  const toggleReject = useProfileStore((s) => s.toggleReject);
  const readiness = useProfileStore((s) => s.readiness);
  const jobs = useProfileStore((s) => s.jobSuggestions);
  const confirmed = useProfileStore((s) => s.confirmedCompetencies());

  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!storeSessionId || storeSessionId !== params.sessionId) {
      router.push("/");
    }
  }, [storeSessionId, params.sessionId, router]);

  if (!storeSessionId) return null;

  async function downloadPdf() {
    if (!readiness) return;
    const readinessData = readiness;
    const sessionId = storeSessionId;
    const confirmedData = confirmed;
    setDownloading(true);
    try {
      const mod = await import("@react-pdf/renderer");
      const { pdf, Document, Page, Text, View, StyleSheet } = mod;

      const styles = StyleSheet.create({
        page: { padding: 40, fontSize: 12, backgroundColor: "#060B17", color: "#E8EEFF" },
        wordmark: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
        accent: { color: "#60A5FA" },
        sessionLine: { fontSize: 11, color: "#7B93BB", marginBottom: 20 },
        scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 16 },
        scoreBig: { fontSize: 48, fontWeight: "bold", color: "#E8EEFF" },
        scoreUnit: { fontSize: 18, color: "#7B93BB" },
        sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#7B93BB", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 20, marginBottom: 8 },
        competencyRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6, gap: 8 },
        bullet: { color: "#60A5FA", fontSize: 14 },
        competencyLabel: { fontSize: 12, color: "#E8EEFF", flex: 1 },
        competencySub: { fontSize: 11, color: "#7B93BB" },
        reasoning: { fontSize: 12, color: "#7B93BB", lineHeight: 1.6, marginTop: 4 },
        strengthLabel: { fontSize: 11, color: "#FCD34D", marginTop: 8 },
        devLabel: { fontSize: 11, color: "#FDE68A", marginTop: 4 },
        divider: { borderBottomWidth: 1, borderBottomColor: "#1C2C45", marginVertical: 16 },
      });

      function Doc() {
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 4 }}>
                <Text style={styles.wordmark}>San</Text>
                <Text style={[styles.wordmark, styles.accent]}>.AI</Text>
              </View>
              <Text style={styles.sessionLine}>Session {sessionId}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>TESDA Readiness</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreBig}>{Math.round(readinessData.score)}</Text>
                <Text style={styles.scoreUnit}>/ 100</Text>
              </View>
              <Text style={styles.reasoning}>{readinessData.reasoning}</Text>
              {readinessData.matched_competencies.length > 0 && (
                <Text style={styles.strengthLabel}>
                  Strengths: {readinessData.matched_competencies.join(", ")}
                </Text>
              )}
              {readinessData.missing_competencies.length > 0 && (
                <Text style={styles.devLabel}>
                  Areas to develop: {readinessData.missing_competencies.join(", ")}
                </Text>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Your Skills</Text>
              {confirmedData.map((c) => (
                <View key={c.id} style={styles.competencyRow}>
                  <Text style={styles.bullet}>›</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.competencyLabel}>{c.taglish_label}</Text>
                    <Text style={styles.competencySub}>{c.english_label}</Text>
                  </View>
                </View>
              ))}
            </Page>
          </Document>
        );
      }

      const blob = await pdf(<Doc />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sanai-${sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function deleteData() {
    setDeleting(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
    } finally {
      resetCapture();
      resetProfile();
      resetSession();
      setDeleting(false);
      router.push("/");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8 animate-fade-up [animation-fill-mode:both]">
        <div className="mb-1 flex items-baseline gap-0.5">
          <span className="text-[24px] font-[800] leading-none tracking-tight text-fg">San</span>
          <span className="text-[24px] font-[800] leading-none tracking-tight text-accent-fg">.AI</span>
        </div>
        <h1 className="text-[30px] font-[800] leading-[1.2] tracking-tight">
          {tl.profile.headline}
        </h1>
        {transcript && (
          <p className="mt-3 rounded-md border border-border bg-bg-subtle px-4 py-3 text-[14px] italic leading-relaxed text-fg-muted">
            "{transcript}"
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        {competencies.map((c, i) => (
          <div
            key={c.id}
            className="animate-fade-up [animation-fill-mode:both]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CompetencyCard
              competency={c}
              rejected={rejectedIds.has(c.id)}
              onToggle={() => toggleReject(c.id)}
            />
          </div>
        ))}
      </section>

      {readiness && (
        <section className="mt-10 animate-fade-up [animation-delay:200ms] [animation-fill-mode:both]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tl.profile.readinessTitle}</CardTitle>
                <Badge variant="outline" className="text-accent-fg border-accent-emphasis/40">
                  TESDA SMAW NC II
                </Badge>
              </div>
              <CardDescription>{tl.profile.disclaimer}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-[52px] font-[800] leading-none tabular-nums text-fg">
                  {Math.round(readiness.score)}
                </span>
                <span className="mb-1 text-[20px] font-semibold text-fg-muted">/ 100</span>
              </div>
              <Progress value={Math.round(readiness.score)} />
              <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
                {readiness.reasoning}
              </p>
              {readiness.matched_competencies.length > 0 && (
                <div className="mt-4 rounded-md border border-success-emphasis/30 bg-success-subtle px-3 py-2">
                  <p className="text-[13px] font-semibold text-success-fg uppercase tracking-wider mb-1">
                    Strengths
                  </p>
                  <p className="text-[14px] text-success-fg">
                    {readiness.matched_competencies.join(", ")}
                  </p>
                </div>
              )}
              {readiness.missing_competencies.length > 0 && (
                <div className="mt-3 rounded-md border border-attention-emphasis/30 bg-attention-subtle px-3 py-2">
                  <p className="text-[13px] font-semibold text-attention-fg uppercase tracking-wider mb-1">
                    Areas to develop
                  </p>
                  <p className="text-[14px] text-attention-fg">
                    {readiness.missing_competencies.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full min-h-[52px] text-[16px]"
                onClick={downloadPdf}
                disabled={downloading}
              >
                {downloading ? "Generating PDF…" : tl.profile.pdfCta}
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mt-8 animate-fade-up [animation-delay:280ms] [animation-fill-mode:both]">
          <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-widest text-accent-fg">
            Opportunities
          </h2>
          <h3 className="mb-4 text-[22px] font-[800] leading-tight tracking-tight">
            {tl.profile.jobsTitle}
          </h3>
          <div className="flex flex-col gap-3">
            {jobs.map((j, i) => (
              <Card
                key={i}
                size="sm"
                className="animate-fade-up [animation-fill-mode:both]"
                style={{ animationDelay: `${320 + i * 60}ms` }}
              >
                <CardHeader>
                  <CardTitle>{j.archetype}</CardTitle>
                  <CardDescription>{j.reasoning}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 animate-fade-up [animation-delay:400ms] [animation-fill-mode:both]">
        <Button
          size="lg"
          className="w-full min-h-[52px] text-[16px]"
          variant="destructive"
          onClick={deleteData}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : tl.footer.deleteData}
        </Button>
      </footer>
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
    <Card
      className={rejected ? "opacity-50 grayscale" : ""}
      size="sm"
    >
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{tl.profile.aiBadge}</Badge>
          <Badge variant={rejected ? "outline" : "default"}>
            {rejected ? tl.profile.stateRejected : tl.profile.stateConfirmed}
          </Badge>
        </div>
        <CardTitle>{competency.taglish_label}</CardTitle>
        <CardDescription>{competency.english_label}</CardDescription>
      </CardHeader>
      {competency.evidence_span && (
        <CardContent>
          <p className="text-[13px] italic leading-relaxed text-fg-muted border-l-2 border-border-muted pl-3">
            "…{competency.evidence_span}…"
          </p>
        </CardContent>
      )}
      <CardFooter>
        <Button
          variant={rejected ? "secondary" : "outline"}
          className="w-full min-h-[44px]"
          onClick={onToggle}
          aria-pressed={rejected}
        >
          {rejected ? tl.profile.restore : tl.profile.reject}
        </Button>
      </CardFooter>
    </Card>
  );
}
