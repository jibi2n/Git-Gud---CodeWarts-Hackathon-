"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

function isAllowedResume(file: File): boolean {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return ext === "pdf" || ext === "doc" || ext === "docx";
}

function resumeContentType(file: File): string {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return file.type || "application/octet-stream";
}

export default function DocumentsPage() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const audioUrl = useCaptureStore((s) => s.audioUrl);

  const documents = useCaptureStore((s) => s.documents);
  const addDocument = useCaptureStore((s) => s.addDocument);
  const removeDocument = useCaptureStore((s) => s.removeDocument);
  const setDocumentUrl = useCaptureStore((s) => s.setDocumentUrl);
  const setDocumentUploadStatus = useCaptureStore((s) => s.setDocumentUploadStatus);
  const resumeFile = useCaptureStore((s) => s.resumeFile);
  const resumeUploadStatus = useCaptureStore((s) => s.resumeUploadStatus);
  const setResumeFile = useCaptureStore((s) => s.setResumeFile);
  const setResumeUrl = useCaptureStore((s) => s.setResumeUrl);
  const setResumeUploadStatus = useCaptureStore((s) => s.setResumeUploadStatus);

  const [error, setError] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!sessionId) router.push("/");
  }, [sessionId, router]);

  const remaining = Math.max(0, 5 - documents.length);
  const hasDocuments = documents.length > 0;
  const allUploaded = hasDocuments && documents.every((d) => d.uploadStatus === "uploaded" || d.uploadStatus === "error");

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

  async function onResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!sessionId) return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    if (!isAllowedResume(file)) {
      setError("Please upload a PDF or Word file (.pdf, .doc, .docx).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file is too large. Please upload a file under 10MB.");
      return;
    }

    setResumeFile(file);
    setResumeUploadStatus("uploading");

    try {
      const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
      const path = `sessions/${sessionId}/resume.${ext}`;
      const primaryContentType = resumeContentType(file);
      let signedUrl: string;
      try {
        signedUrl = await uploadToSupabaseStorage({
          bucket: "documents",
          path,
          file,
          contentType: primaryContentType,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("mime type") && msg.includes("is not supported")) {
          signedUrl = await uploadToSupabaseStorage({
            bucket: "documents",
            path,
            file,
            contentType: "application/octet-stream",
          });
        } else {
          throw e;
        }
      }
      setResumeUrl(signedUrl);
      setResumeUploadStatus("uploaded");
    } catch (err) {
      setResumeUploadStatus("error");
      const message =
        err instanceof Error && err.message ? err.message : tl.errors.generic;
      setError(message);
    }
  }

  function removeResume() {
    setResumeFile(null);
    setResumeUrl(null);
    setResumeUploadStatus("idle");
  }

  function goProcessing() {
    const audio = audioUrl ?? "demo://taglish-sample-1";
    router.push(`/processing?audio=${encodeURIComponent(audio)}`);
  }

  const previewUrls = useMemo(() => {
    return documents.map((d) => ({
      id: d.id,
      url: URL.createObjectURL(d.file),
    }));
  }, [documents]);

  useEffect(() => {
    return () => {
      for (const p of previewUrls) URL.revokeObjectURL(p.url);
    };
  }, [previewUrls]);

  if (!sessionId) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-10">
      <header className="mb-6 animate-fade-up [animation-fill-mode:both]">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-accent-fg">
          Step 2 of 3
        </p>
        <h1 className="text-[26px] font-[800] leading-[1.2] tracking-tight">
          {tl.documents.headline}
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">
          {tl.documents.sub}
        </p>
      </header>

      <div className="animate-fade-up [animation-delay:60ms] [animation-fill-mode:both]">
        <DocumentCamera maxImages={remaining} onAdd={onAdd} onSkip={goProcessing} />
      </div>

      <section className="mt-5 animate-fade-up [animation-delay:90ms] [animation-fill-mode:both]">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold">Resume (optional)</div>
              <p className="mt-1 text-[13px] text-fg-muted">
                Upload a PDF or Word file so you can keep it with this session.
              </p>
            </div>
            <div className={cn(resumeUploadStatus === "uploading" ? "opacity-60" : "")}>
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onResumeChange}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={resumeUploadStatus === "uploading"}
                onClick={() => resumeInputRef.current?.click()}
              >
                {resumeFile ? "Replace" : "Upload"}
              </Button>
            </div>
          </div>

          {resumeFile && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-[13px] font-medium break-all">{resumeFile.name}</div>
                <Badge
                  variant={
                    resumeUploadStatus === "uploaded"
                      ? "success"
                      : resumeUploadStatus === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="w-fit"
                >
                  {resumeUploadStatus === "uploaded"
                    ? "Uploaded"
                    : resumeUploadStatus === "uploading"
                    ? "Uploading…"
                    : resumeUploadStatus === "error"
                    ? "Error"
                    : "Ready"}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={removeResume}
                disabled={resumeUploadStatus === "uploading"}
              >
                Remove
              </Button>
            </div>
          )}
        </Card>
      </section>

      {hasDocuments && (
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
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 rounded-md object-cover shrink-0"
                  />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="text-[14px] font-semibold">Document {i + 1}</div>
                      <Badge
                        variant={
                          d.uploadStatus === "uploaded"
                            ? "success"
                            : d.uploadStatus === "error"
                            ? "destructive"
                            : "secondary"
                        }
                        className="w-fit"
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
                      className="shrink-0 text-[13px]"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-danger-emphasis/50 bg-danger-subtle px-4 py-3 text-[14px] text-danger-fg"
        >
          {error}
        </div>
      )}

      <div className="mt-auto pt-6">
        <button
          className={cn(
            "w-full min-h-[52px] rounded-md border text-[16px] font-semibold transition-all duration-200",
            allUploaded
              ? "border-green-600 bg-green-600 text-white hover:bg-green-500 hover:border-green-500 shadow-sm shadow-green-600/30"
              : "border-green-600/60 bg-green-600/80 text-white hover:bg-green-500 hover:border-green-500"
          )}
          onClick={goProcessing}
        >
          {tl.documents.done}
        </button>
      </div>
    </main>
  );
}
