"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { tl } from "@/locales/tl";
import { VoiceRecorder, type RecorderError } from "@/components/capture/VoiceRecorder";
import { useCaptureStore } from "@/stores/capture-store";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { Button } from "@/components/ui/button";

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
    router.push(`/processing?audio=demo://taglish-sample-1`);
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-10">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          {tl.record.headline}
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          {tl.record.sub}
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6">
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
            className="rounded-md border border-danger-emphasis bg-danger-subtle px-4 py-3 text-[16px] text-danger-fg"
          >
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={goNext}
          disabled={audioUploadStatus === "idle" || audioUploadStatus === "uploading"}
        >
          {audioUploadStatus === "uploading"
            ? tl.record.uploading
            : audioUploadStatus === "uploaded" || audioUploadStatus === "error"
            ? tl.record.next
            : tl.record.cta}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={startDemoFlow}
        >
          {tl.record.skip}
        </Button>
      </div>
    </main>
  );
}
