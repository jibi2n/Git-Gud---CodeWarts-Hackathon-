"use client";

import { useProfileStore } from "@/stores/profile-store";
import { useSessionStore } from "@/stores/session-store";
import { useCaptureStore } from "@/stores/capture-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

function tesdaRegulationUrl(trackId: string): string {
  switch (trackId) {
    case "welding-smaw-nc2":
    case "tesda_welder_nc_ii":
      return "https://tesda.gov.ph/Download/Training_Regulations?page=26";
    default:
      return "https://tesda.gov.ph/Download/Training_Regulations";
  }
}

function jobListingUrl(archetype: string): string {
  const q = encodeURIComponent(`${archetype} Philippines`);
  return `https://www.google.com/search?q=${q}`;
}

type LatLng = { lat: number; lng: number };

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function hashToUnit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function offsetByMeters(origin: LatLng, eastMeters: number, northMeters: number): LatLng {
  const latRad = (origin.lat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(latRad);
  return {
    lat: origin.lat + northMeters / metersPerDegLat,
    lng: origin.lng + eastMeters / metersPerDegLng,
  };
}

function makeNearbyPoints(center: LatLng, seed: string, count: number, radiusMeters: number): LatLng[] {
  const out: LatLng[] = [];
  for (let i = 0; i < count; i++) {
    const u = hashToUnit(`${seed}:${i}:r`);
    const v = hashToUnit(`${seed}:${i}:t`);
    const r = Math.sqrt(u) * radiusMeters;
    const theta = v * Math.PI * 2;
    const east = Math.cos(theta) * r;
    const north = Math.sin(theta) * r;
    out.push(offsetByMeters(center, east, north));
  }
  return out;
}

function googleMapsDirectionsUrl(dest: LatLng): string {
  const q = encodeURIComponent(`${dest.lat},${dest.lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

function mapboxStaticUrl(options: {
  token: string;
  user: LatLng;
  pins: Array<{ id: string; at: LatLng }>;
}): string {
  const center = `${options.user.lng},${options.user.lat}`;
  const userPin = `pin-s+2563eb(${options.user.lng},${options.user.lat})`;
  const jobPins = options.pins.map((p) => `pin-s+f97316(${p.at.lng},${p.at.lat})`);
  const overlays = [userPin, ...jobPins].join(",");
  const token = encodeURIComponent(options.token);
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/${center},14/600x360?access_token=${token}&logo=false&attribution=false`;
}

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
  const tesdaUrl = tesdaRegulationUrl(readiness?.track_id ?? "");
  const resumeUrl = useCaptureStore((s) => s.resumeUrl);
  const resumeFile = useCaptureStore((s) => s.resumeFile);
  const documents = useCaptureStore((s) => s.documents);

  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const documentPreviews = useMemo(() => {
    return documents.map((d) => ({
      id: d.id,
      localUrl: URL.createObjectURL(d.file),
      signedUrl: d.url,
    }));
  }, [documents]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "denied" | "unavailable" | "error"
  >("idle");

  const nearbyJobs = useMemo(() => {
    if (!location || jobs.length === 0) return [];
    const pts = makeNearbyPoints(location, `${storeSessionId}:jobs`, jobs.length, 1800);
    return jobs
      .map((j, i) => {
        const at = pts[i] ?? location;
        const distanceKm = haversineKm(location, at);
        return { job: j, at, distanceKm };
      })
      .filter((x) => x.distanceKm <= 2)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [jobs, location, storeSessionId]);

  const mapUrl = useMemo(() => {
    if (!location || !mapboxToken || nearbyJobs.length === 0) return null;
    return mapboxStaticUrl({
      token: mapboxToken,
      user: location,
      pins: nearbyJobs.map((x, i) => ({ id: `${i}`, at: x.at })),
    });
  }, [location, mapboxToken, nearbyJobs]);

  useEffect(() => {
    return () => {
      for (const p of documentPreviews) URL.revokeObjectURL(p.localUrl);
    };
  }, [documentPreviews]);

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

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("idle");
      },
      (err) => {
        if (err.code === 1) setLocationStatus("denied");
        else if (err.code === 2) setLocationStatus("unavailable");
        else setLocationStatus("error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    );
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
        {documentPreviews.length > 0 && (
          <div className="mt-4 rounded-md border border-border bg-bg-subtle px-4 py-3">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-fg-muted">
              Uploaded images
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {documentPreviews.map((p) => (
                <a
                  key={p.id}
                  href={p.signedUrl ?? p.localUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-md border border-border-muted focus:outline-none focus:ring-2 focus:ring-accent-fg/40"
                  aria-label="Open uploaded image"
                >
                  <Image
                    src={p.localUrl}
                    alt=""
                    width={160}
                    height={160}
                    unoptimized
                    className="h-20 w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {resumeUrl && (
          <div className="mt-3">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-border bg-bg-subtle px-4 py-2 text-[14px] font-semibold text-fg-muted transition-colors hover:text-fg hover:border-border-muted"
              aria-label="Open uploaded resume"
            >
              View resume{resumeFile?.name ? `: ${resumeFile.name}` : ""}
            </a>
          </div>
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
                <a
                  className="mt-3 block rounded-md border border-purple-500/30 bg-purple-950/30 px-3 py-2 transition-colors hover:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                  href={tesdaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open TESDA training regulation"
                >
                  <p className="text-[13px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Areas to develop
                  </p>
                  <p className="text-[14px] text-purple-300">
                    {readiness.missing_competencies.join(", ")}
                  </p>
                </a>
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
        <section className="mt-8 animate-fade-up [animation-delay:260ms] [animation-fill-mode:both]">
          <h2 className="mb-4 text-[22px] font-[800] leading-tight tracking-tight text-white">
            {tl.profile.nearbyJobsTitle}
          </h2>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={requestLocation}
              disabled={locationStatus === "loading"}
            >
              {locationStatus === "loading" ? "Locating…" : tl.profile.nearbyJobsCta}
            </Button>
            {location ? (
              <span className="text-[13px] text-fg-muted">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            ) : null}
          </div>

          {locationStatus === "denied" && (
            <div className="mt-3 rounded-md border border-border bg-bg-subtle px-4 py-3 text-[14px] text-fg-muted">
              {tl.profile.nearbyJobsDenied}
            </div>
          )}
          {(locationStatus === "unavailable" || locationStatus === "error") && (
            <div className="mt-3 rounded-md border border-border bg-bg-subtle px-4 py-3 text-[14px] text-fg-muted">
              {tl.profile.nearbyJobsUnavailable}
            </div>
          )}

          {location && nearbyJobs.length === 0 && (
            <div className="mt-3 rounded-md border border-border bg-bg-subtle px-4 py-3 text-[14px] text-fg-muted">
              {tl.profile.nearbyJobsNoResults}
            </div>
          )}

          {location && nearbyJobs.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {mapUrl && (
                <div className="overflow-hidden rounded-md border border-border bg-bg-subtle">
                  <img src={mapUrl} alt="" className="h-auto w-full" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                {nearbyJobs.map((x, i) => (
                  <Card key={i} size="sm" className="bg-bg-subtle">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-white">{x.job.archetype}</CardTitle>
                          <CardDescription>{Math.round(x.distanceKm * 1000)}m away</CardDescription>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a
                            href={googleMapsDirectionsUrl(x.at)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-border bg-bg-subtle px-3 py-2 text-[13px] font-semibold text-fg-muted transition-colors hover:text-fg hover:border-border-muted"
                            aria-label={`Open directions for ${x.job.archetype}`}
                          >
                            Directions
                          </a>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
                <a
                  key={i}
                  className="block focus:outline-none focus:ring-2 focus:ring-orange-400/40 rounded-md"
                  href={jobListingUrl(j.archetype)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open job listings for ${j.archetype}`}
                >
                  <Card
                    size="sm"
                    className={`animate-fade-up [animation-fill-mode:both] ${accent}`}
                    style={{ animationDelay: `${320 + i * 60}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className={titleColor}>{j.archetype}</CardTitle>
                      <CardDescription>{j.reasoning}</CardDescription>
                    </CardHeader>
                  </Card>
                </a>
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
