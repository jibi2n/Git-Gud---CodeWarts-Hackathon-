"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";
import { VoiceRecorder, type RecorderError } from "@/components/capture/VoiceRecorder";
import { useCaptureStore } from "@/stores/capture-store";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RecordPage() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const setAudio = useCaptureStore((s) => s.setAudio);
  const setAudioUrl = useCaptureStore((s) => s.setAudioUrl);
  const audioUploadStatus = useCaptureStore((s) => s.audioUploadStatus);
  const setAudioUploadStatus = useCaptureStore((s) => s.setAudioUploadStatus);

  const [error, setError] = useState<string | null>(null);

  async function startDemoFlow() {
    if (!sessionId) {
      router.push("/");
      return;
    }
    setAudioUrl(null);
    router.push("/documents");
  }

  async function upload(blob: Blob) {
    if (!sessionId) return;

    setError(null);
    setAudioUploadStatus("uploading");
    try {
      const path = `sessions/${sessionId}/${Date.now()}.webm`;
      const signedUrl = await uploadToSupabaseStorage({
        bucket: "audio",
        path,
        file: blob,
        contentType: blob.type || "audio/webm",
      });
      setAudioUrl(signedUrl);
      setAudioUploadStatus("uploaded");
    } catch (e) {
      setAudioUploadStatus("error");
      setError(tl.errors.generic);
    }
  }

  function onRecorderError(_err: RecorderError) {
    setError(tl.errors.generic);
  }

  function goNext() {
    router.push("/documents");
  }

  const canContinue = audioUploadStatus === "uploaded" || audioUploadStatus === "error";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-10">
      <header className="mb-6 animate-fade-up [animation-fill-mode:both]">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-accent-fg">
          Step 1 of 3
        </p>
        <h1 className="text-[26px] font-[800] leading-[1.2] tracking-tight">
          {tl.record.headline}
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">
          {tl.record.sub}
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-4 animate-fade-up [animation-delay:60ms] [animation-fill-mode:both]">
        <VoiceRecorder
          onComplete={(blob) => {
            setAudio(blob);
            void upload(blob);
          }}
          onError={onRecorderError}
        />

        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger-emphasis/50 bg-danger-subtle px-4 py-3 text-[14px] text-danger-fg"
          >
            {error}
          </div>
        )}

        <button
          className={cn(
            "w-full min-h-[52px] rounded-md border text-[16px] font-semibold transition-all duration-200",
            canContinue
              ? "border-green-600 bg-green-600 text-white hover:bg-green-500 hover:border-green-500 shadow-sm shadow-green-600/30"
              : "border-border bg-bg-subtle text-fg-subtle cursor-not-allowed opacity-40"
          )}
          onClick={goNext}
          disabled={!canContinue}
        >
          {audioUploadStatus === "uploading" ? tl.record.uploading : tl.record.next}
        </button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full min-h-[44px] text-[14px] text-fg-muted"
          onClick={startDemoFlow}
        >
          {tl.record.skip}
        </Button>
      </div>
    </main>
  );
}
