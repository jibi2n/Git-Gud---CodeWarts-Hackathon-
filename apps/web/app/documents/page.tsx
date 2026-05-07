"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { useCaptureStore } from "@/stores/capture-store";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { DocumentCamera } from "@/components/capture/DocumentCamera";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { tl } from "@/locales/tl";

export default function DocumentsPage() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const audioUrl = useCaptureStore((s) => s.audioUrl);

  const documents = useCaptureStore((s) => s.documents);
  const addDocument = useCaptureStore((s) => s.addDocument);
  const removeDocument = useCaptureStore((s) => s.removeDocument);
  const setDocumentUrl = useCaptureStore((s) => s.setDocumentUrl);
  const setDocumentUploadStatus = useCaptureStore((s) => s.setDocumentUploadStatus);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) router.push("/");
  }, [sessionId, router]);

  const remaining = Math.max(0, 5 - documents.length);

  async function onAdd(file: File) {
    if (!sessionId) return;
    if (documents.length >= 5) return;

    setError(null);
    const id = addDocument(file);
    setDocumentUploadStatus(id, "uploading");

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `sessions/${sessionId}/${id}.${ext}`;
      const signedUrl = await uploadToSupabaseStorage({
        bucket: "documents",
        path,
        file,
        contentType: file.type || "image/jpeg",
      });
      setDocumentUrl(id, signedUrl);
      setDocumentUploadStatus(id, "uploaded");
    } catch (e) {
      setDocumentUploadStatus(id, "error");
      setError(tl.errors.generic);
    }
  }

  function goProcessing() {
    const audio = audioUrl ?? "demo://taglish-sample-1";
    router.push(`/processing?audio=${encodeURIComponent(audio)}`);
  }

  const previewUrls = useMemo(() => {
    const pairs = documents.map((d) => ({
      id: d.id,
      url: URL.createObjectURL(d.file),
    }));
    return pairs;
  }, [documents]);

  useEffect(() => {
    return () => {
      for (const p of previewUrls) URL.revokeObjectURL(p.url);
    };
  }, [previewUrls]);

  if (!sessionId) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-6 animate-fade-up [animation-fill-mode:both]">
        <p className="mb-1 text-[13px] font-semibold uppercase tracking-widest text-accent-fg">
          Step 2 of 3
        </p>
        <h1 className="text-[30px] font-[800] leading-[1.2] tracking-tight">
          {tl.documents.headline}
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-fg-muted">
          {tl.documents.sub}
        </p>
      </header>

      <div className="animate-fade-up [animation-delay:60ms] [animation-fill-mode:both]">
        <DocumentCamera maxImages={remaining} onAdd={onAdd} onSkip={goProcessing} />
      </div>

      <section className="mt-5 flex flex-col gap-3">
        {documents.map((d, i) => {
          const preview = previewUrls.find((p) => p.id === d.id)?.url ?? "";
          return (
            <Card
              key={d.id}
              className="p-3 animate-fade-up [animation-fill-mode:both]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex gap-3">
                <Image
                  src={preview}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-semibold">Document {i + 1}</div>
                    <Badge
                      variant={
                        d.uploadStatus === "uploaded"
                          ? "success"
                          : d.uploadStatus === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {d.uploadStatus === "uploaded"
                        ? "Uploaded"
                        : d.uploadStatus === "uploading"
                        ? "Uploading…"
                        : d.uploadStatus === "error"
                        ? "Error"
                        : "Ready"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(d.id)}
                    disabled={d.uploadStatus === "uploading"}
                    className="w-fit"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-md border border-danger-emphasis/50 bg-danger-subtle px-4 py-3 text-[15px] text-danger-fg"
        >
          {error}
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={goProcessing}
        >
          {tl.documents.done}
        </Button>
      </div>
    </main>
  );
}
