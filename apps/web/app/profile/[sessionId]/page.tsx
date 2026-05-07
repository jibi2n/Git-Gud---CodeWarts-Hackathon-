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
        page: { padding: 32, fontSize: 12 },
        title: { fontSize: 20, marginBottom: 8 },
        sectionTitle: { fontSize: 14, marginTop: 16, marginBottom: 6 },
        row: { flexDirection: "row", justifyContent: "space-between" },
        pill: {
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: "#111827",
          color: "#ffffff",
          fontSize: 10,
        },
        item: { marginBottom: 4 },
      });

      function Doc() {
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <Text style={styles.title}>{tl.app.name} Profile</Text>
              <View style={styles.row}>
                <Text>Session: {sessionId}</Text>
                <Text style={styles.pill}>
                  Readiness {Math.round(readinessData.score)}/100
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Competencies</Text>
              {confirmedData.map((c) => (
                <Text key={c.id} style={styles.item}>
                  • {c.taglish_label} ({c.english_label})
                </Text>
              ))}

              <Text style={styles.sectionTitle}>Readiness</Text>
              <Text>{readinessData.reasoning}</Text>
              {readinessData.matched_competencies.length > 0 && (
                <Text style={{ marginTop: 6 }}>
                  Strengths: {readinessData.matched_competencies.join(", ")}
                </Text>
              )}
              {readinessData.missing_competencies.length > 0 && (
                <Text style={{ marginTop: 4 }}>
                  Areas to develop: {readinessData.missing_competencies.join(", ")}
                </Text>
              )}
            </Page>
          </Document>
        );
      }

      const blob = await pdf(<Doc />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boses-${sessionId}.pdf`;
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
        <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>{tl.profile.readinessTitle}</CardTitle>
              <CardDescription>{tl.profile.disclaimer}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-[30px] font-semibold leading-none">
                  {Math.round(readiness.score)}
                </span>
                <span className="text-[17px] text-fg-muted">/ 100</span>
              </div>
              <div className="mt-3">
                <Progress value={Math.round(readiness.score)} />
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
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                size="lg"
                className="w-full min-h-[56px] text-[17px]"
                variant="secondary"
                onClick={downloadPdf}
                disabled={downloading}
              >
                {downloading ? tl.record.ctaProcessing : tl.profile.pdfCta}
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[20px] font-semibold leading-tight">
            {tl.profile.jobsTitle}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {jobs.map((j, i) => (
              <Card key={i} size="sm">
                <CardHeader>
                  <CardTitle>{j.archetype}</CardTitle>
                  <CardDescription>{j.reasoning}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10">
        <Button
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          variant="destructive"
          onClick={deleteData}
          disabled={deleting}
        >
          {deleting ? tl.record.ctaProcessing : tl.footer.deleteData}
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
    <Card className={rejected ? "opacity-60" : ""} size="sm">
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
      <CardContent>
        {competency.evidence_span && (
          <p className="text-[14px] italic leading-relaxed text-fg-muted">
            “…{competency.evidence_span}…”
          </p>
        )}
      </CardContent>
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
