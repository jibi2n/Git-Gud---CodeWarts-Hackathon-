"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { tl } from "@/locales/tl";

export type RecorderError = {
  code: "not-supported" | "permission-denied" | "recording-failed";
  message: string;
};

type VoiceRecorderProps = {
  maxDurationSec?: number;
  onComplete: (blob: Blob, durationSec: number) => void;
  onError: (err: RecorderError) => void;
};

type Status = "idle" | "recording" | "stopping";

export function VoiceRecorder({
  maxDurationSec = 180,
  onComplete,
  onError,
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [durationMs, setDurationMs] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);

  const durationSec = Math.floor(durationMs / 1000);

  const mimeType = useMemo(() => {
    if (typeof MediaRecorder === "undefined") return null;
    const preferred = "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported(preferred)) return preferred;
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    return null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  async function start() {
    if (!mimeType) {
      onError({ code: "not-supported", message: "MediaRecorder unsupported" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      chunksRef.current = [];
      startedAtRef.current = performance.now();
      setDurationMs(0);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        onError({ code: "recording-failed", message: "Recorder error" });
      };

      recorder.onstop = () => {
        const end = performance.now();
        const startMs = startedAtRef.current ?? end;
        const duration = Math.max(0, Math.round((end - startMs) / 1000));
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();
        setStatus("idle");
        onComplete(blob, duration);
      };

      setupWaveform(stream);
      recorder.start(250);
      setStatus("recording");
      startTimer();
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        onError({ code: "permission-denied", message: "Mic permission denied" });
      } else {
        onError({ code: "recording-failed", message: "Mic start failed" });
      }
      cleanup();
      setStatus("idle");
    }
  }

  function stop() {
    if (status !== "recording") return;
    setStatus("stopping");
    try {
      mediaRecorderRef.current?.stop();
      //mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    } catch {
      onError({ code: "recording-failed", message: "Stop failed" });
      cleanup();
      setStatus("idle");
    }
  }

  function startTimer() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const startMs = startedAtRef.current;
      if (!startMs) return;
      const elapsed = performance.now() - startMs;
      setDurationMs(elapsed);
      if (elapsed >= maxDurationSec * 1000) {
        stop();
      }
    }, 100);
  }

  function setupWaveform(stream: MediaStream) {
    if (!canvasRef.current) return;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    analyserDataRef.current = new Uint8Array(
      new ArrayBuffer(analyser.frequencyBinCount)
    );

    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const analyserNode = analyserRef.current;
      const data = analyserDataRef.current;
      if (!analyserNode || !data) return;

      analyserNode.getByteTimeDomainData(data as unknown as Uint8Array<ArrayBuffer>);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(16, 185, 129)";
      ctx.beginPath();

      const sliceWidth = width / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }

  function cleanup() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    analyserRef.current = null;
    analyserDataRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;

    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
    }
    streamRef.current = null;

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full rounded-lg border border-border bg-bg-default p-4">
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-medium">00:{String(durationSec).padStart(2, "0")}</div>
          <div className="text-[13px] text-fg-muted">
            {status === "recording"
              ? "Recording"
              : status === "stopping"
              ? "Stopping"
              : "Ready"}
          </div>
        </div>
        <div className="mt-3">
          <canvas
            ref={canvasRef}
            width={320}
            height={64}
            className="h-16 w-full rounded-md bg-bg-subtle"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full min-h-[56px] text-[17px]"
        onClick={status === "recording" ? stop : start}
        disabled={status === "stopping"}
      >
        {status === "recording" ? tl.record.stop : tl.record.cta}
      </Button>
    </div>
  );
}
