"use client";

import { useMemo } from "react";
import type { WeldingJob } from "@/lib/welding-jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Point = { x: number; y: number };

export function WeldingMap({
  origin,
  jobs,
  selectedId,
  onSelect,
}: {
  origin: { lat: number; lng: number };
  jobs: WeldingJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const bounds = useMemo(() => {
    const lats = [origin.lat, ...jobs.map((j) => j.lat)];
    const lngs = [origin.lng, ...jobs.map((j) => j.lng)];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = (maxLat - minLat) * 0.15 || 0.01;
    const padLng = (maxLng - minLng) * 0.15 || 0.01;
    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [jobs, origin.lat, origin.lng]);

  const toPoint = (lat: number, lng: number): Point => {
    const w = 320;
    const h = 280;
    const x =
      ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * w;
    const y =
      (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * h;
    return { x, y };
  };

  const originPt = toPoint(origin.lat, origin.lng);

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>Nearby Jobs (Demo Map)</CardTitle>
        <div className="text-[13px] text-fg-muted">
          This is an in-app map surface for the demo (no external map tiles).
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[280px] w-full overflow-hidden rounded-md border border-border bg-bg-subtle">
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: originPt.x, top: originPt.y }}
            aria-label="Your location"
          >
            <div className="h-4 w-4 rounded-full bg-accent-emphasis ring-2 ring-white" />
          </div>

          {jobs.map((j) => {
            const pt = toPoint(j.lat, j.lng);
            const selected = j.id === selectedId;
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => onSelect(j.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pt.x, top: pt.y }}
                aria-label={`${j.title} marker`}
              >
                <div
                  className={`h-4 w-4 rounded-full border ${
                    selected
                      ? "border-accent-emphasis bg-accent-subtle"
                      : "border-border bg-bg-default"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          <Badge variant="secondary">● You</Badge>
          <Badge variant="outline">● Jobs</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

