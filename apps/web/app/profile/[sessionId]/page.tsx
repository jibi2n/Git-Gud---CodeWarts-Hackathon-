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
    const sessionId = storeSessionId;
    const confirmedData = confirmed;
    const readinessData = readiness;
    setDownloading(true);
    try {
      const mod = await import("@react-pdf/renderer");
      const { pdf, Document, Page, Text, View, StyleSheet } = mod;

      const S = StyleSheet.create({
        page: {
          flexDirection: "column",
          padding: 48,
          fontSize: 11,
          fontFamily: "Helvetica",
          backgroundColor: "#FFFFFF",
          color: "#111111",
        },
        header: { flexDirection: "column", marginBottom: 24 },
        wordmark: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 2 },
        wordmarkAccent: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#2563EB" },
        sessionLine: { fontSize: 10, color: "#6B7280", marginBottom: 0 },
        divider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB", marginVertical: 16 },
        sectionLabel: {
          fontSize: 9,
          fontFamily: "Helvetica-Bold",
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
        },
        // Score
        scoreRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
        scoreBig: { fontSize: 40, fontFamily: "Helvetica-Bold", color: "#111111", lineHeight: 1 },
        scoreUnit: { fontSize: 16, color: "#6B7280", marginBottom: 4, marginLeft: 4 },
        reasoningText: { fontSize: 11, color: "#374151", lineHeight: 1.5 },
        // Strength / develop boxes
        box: {
          flexDirection: "column",
          borderRadius: 4,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginTop: 10,
        },
        strengthBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" },
        developBox: { backgroundColor: "#FAF5FF", borderWidth: 1, borderColor: "#E9D5FF" },
        boxLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 },
        strengthLabel: { color: "#15803D" },
        developLabel: { color: "#7C3AED" },
        boxText: { fontSize: 11, lineHeight: 1.5 },
        strengthText: { color: "#166534" },
        developText: { color: "#6D28D9" },
        // Skills
        skillRow: {
          flexDirection: "column",
          paddingVertical: 7,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        },
        skillMain: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111111", marginBottom: 2 },
        skillSub: { fontSize: 10, color: "#6B7280" },
        evidenceText: { fontSize: 10, color: "#9CA3AF", fontStyle: "italic", marginTop: 3 },
        // Jobs
        jobRow: {
          flexDirection: "column",
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        },
        jobTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1D4ED8", marginBottom: 3 },
        jobDesc: { fontSize: 10, color: "#374151", lineHeight: 1.4 },
      });

      function Doc() {
        return (
          <Document>
            <Page size="A4" style={S.page}>
              {/* Header */}
              <View style={S.header}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={S.wordmark}>sana</Text>
                  <Text style={S.wordmarkAccent}>.AI</Text>
                </View>
                <Text style={S.sessionLine}>Session ID: {sessionId}</Text>
                <Text style={[S.sessionLine, { marginTop: 2 }]}>
                  Generated: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                </Text>
              </View>

              <View style={S.divider} />

              {/* Skills */}
              {confirmedData.length > 0 && (
                <View style={{ flexDirection: "column", marginBottom: 8 }}>
                  <Text style={S.sectionLabel}>Detected Skills ({confirmedData.length})</Text>
                  {confirmedData.map((c) => (
                    <View key={c.id} style={S.skillRow}>
                      <Text style={S.skillMain}>{c.taglish_label}</Text>
                      {c.english_label ? <Text style={S.skillSub}>{c.english_label}</Text> : null}
                      {c.evidence_span ? (
                        <Text style={S.evidenceText}>"{c.evidence_span}"</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              {/* TESDA Readiness */}
              {readinessData && (
                <View style={{ flexDirection: "column", marginTop: 8 }}>
                  <View style={S.divider} />
                  <Text style={S.sectionLabel}>TESDA Readiness</Text>
                  <View style={S.scoreRow}>
                    <Text style={S.scoreBig}>{Math.round(readinessData.score)}</Text>
                    <Text style={S.scoreUnit}>/ 100</Text>
                  </View>
                  {readinessData.reasoning ? (
                    <Text style={S.reasoningText}>{readinessData.reasoning}</Text>
                  ) : null}

                  {readinessData.matched_competencies.length > 0 && (
                    <View style={[S.box, S.strengthBox]}>
                      <Text style={[S.boxLabel, S.strengthLabel]}>STRENGTHS</Text>
                      <Text style={[S.boxText, S.strengthText]}>
                        {readinessData.matched_competencies.join(", ")}
                      </Text>
                    </View>
                  )}
                  {readinessData.missing_competencies.length > 0 && (
                    <View style={[S.box, S.developBox]}>
                      <Text style={[S.boxLabel, S.developLabel]}>AREAS TO DEVELOP</Text>
                      <Text style={[S.boxText, S.developText]}>
                        {readinessData.missing_competencies.join(", ")}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Page>
          </Document>
        );
      }

      const blob = await pdf(<Doc />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sana-ai-report-${sessionId}.pdf`;
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
          <span className="text-[24px] font-[800] leading-none tracking-tight text-fg">sana</span>
          <span className="text-[24px] font-[800] leading-none tracking-tight text-accent-fg">.AI</span>
        </div>
        <h1 className="text-[30px] font-[800] leading-[1.2] tracking-tight">
          <span className="text-white">Here's your </span>
          <span className="text-orange-400">Kasanayans</span>
          <span className="text-white">!</span>
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
          <Card className="bg-[#0F1E38] border-[#1C3050]">
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
                <div className="mt-4 rounded-md border border-green-500/30 bg-green-950/30 px-3 py-2">
                  <p className="text-[13px] font-semibold text-green-400 uppercase tracking-wider mb-1">
                    Strengths
                  </p>
                  <p className="text-[14px] text-green-300">
                    {readiness.matched_competencies.join(", ")}
                  </p>
                </div>
              )}
              {readiness.missing_competencies.length > 0 && (
                <div className="mt-3 rounded-md border border-purple-500/30 bg-purple-950/30 px-3 py-2">
                  <p className="text-[13px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Areas to develop
                  </p>
                  <p className="text-[14px] text-purple-300">
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
          <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-widest text-orange-400">
            Opportunities
          </h2>
          <h3 className="mb-4 text-[22px] font-[800] leading-tight tracking-tight text-white">
            {tl.profile.jobsTitle}
          </h3>
          <div className="flex flex-col gap-3">
            {jobs.map((j, i) => {
              const accent = i % 3 === 0 ? "border-orange-500/30 bg-orange-950/20" : i % 3 === 1 ? "border-blue-500/30 bg-blue-950/20" : "border-border bg-bg-subtle";
              const titleColor = i % 3 === 0 ? "text-orange-300" : i % 3 === 1 ? "text-blue-300" : "text-white";
              return (
                <Card
                  key={i}
                  size="sm"
                  className={`animate-fade-up [animation-fill-mode:both] ${accent}`}
                  style={{ animationDelay: `${320 + i * 60}ms` }}
                >
                  <CardHeader>
                    <CardTitle className={titleColor}>{j.archetype}</CardTitle>
                    <CardDescription>{j.reasoning}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
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
      className={rejected ? "opacity-50 grayscale bg-bg-subtle" : "bg-bg-subtle"}
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
          variant="outline"
          className={
            rejected
              ? "w-full min-h-[44px] border-border text-fg-muted hover:border-green-500 hover:text-green-400 hover:bg-green-950/20 transition-colors"
              : "w-full min-h-[44px] border-border text-fg-muted hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
          }
          onClick={onToggle}
          aria-pressed={rejected}
        >
          {rejected ? tl.profile.restore : tl.profile.reject}
        </Button>
      </CardFooter>
    </Card>
  );
}
