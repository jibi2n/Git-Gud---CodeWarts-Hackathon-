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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
        <div className="relative overflow-hidden rounded-md border border-border bg-bg-default">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[70%] w-[80%] rounded-md border-2 border-yellow-400/50" />
          </div>
          <video
            ref={videoRef}
            className="h-[300px] w-full object-cover"
            playsInline
            muted
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-default">
              <span className="text-[14px] text-fg-muted">Starting camera…</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-bg-default px-6 py-10 cursor-pointer hover:border-border-muted transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="h-8 w-8 text-fg-subtle"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-fg">Browse files</p>
            <p className="mt-0.5 text-[13px] text-fg-muted">JPG, PNG, or PDF</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!fallback ? (
          <Button
            size="lg"
            className="w-full min-h-[52px] text-[16px]"
            onClick={capture}
            disabled={!ready || maxImages <= 0}
          >
            {tl.documents.capture}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full min-h-[52px] text-[16px]"
            onClick={() => fileInputRef.current?.click()}
            disabled={maxImages <= 0}
          >
            Browse files
          </Button>
        )}

        <Button
          variant="ghost"
          size="lg"
          className="w-full min-h-[44px] text-[14px] text-fg-muted"
          onClick={onSkip}
        >
          {tl.documents.skip}
        </Button>
      </div>
    </div>
  );
}
