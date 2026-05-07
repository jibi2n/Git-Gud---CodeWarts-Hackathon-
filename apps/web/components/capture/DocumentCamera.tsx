"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { tl } from "@/locales/tl";

type DocumentCameraProps = {
  maxImages?: number;
  onAdd: (file: File) => void;
  onSkip: () => void;
};

export function DocumentCamera({
  maxImages = 5,
  onAdd,
  onSkip,
}: DocumentCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) return;
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch {
        setFallback(true);
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
      streamRef.current = null;
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `document-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onAdd(file);
      },
      "image/jpeg",
      0.9
    );
  }

  function onFilePicked(file: File | null) {
    if (!file) return;
    onAdd(file);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {!fallback ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-bg-default">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[70%] w-[80%] rounded-md border-2 border-accent-emphasis/60" />
          </div>
          <video
            ref={videoRef}
            className="h-[340px] w-full object-cover"
            playsInline
            muted
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-default p-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
            className="block w-full text-[16px]"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={capture}
          disabled={fallback || !ready || maxImages <= 0}
        >
          {tl.documents.capture}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={onSkip}
        >
          {tl.documents.skip}
        </Button>
      </div>
    </div>
  );
}
