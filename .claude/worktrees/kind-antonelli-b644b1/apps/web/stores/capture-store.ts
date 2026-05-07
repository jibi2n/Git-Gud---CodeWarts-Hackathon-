"use client";

import { create } from "zustand";

export type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

type DocumentItem = {
  id: string;
  file: File;
  url: string | null;
  uploadStatus: UploadStatus;
};

type CaptureState = {
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioUploadStatus: UploadStatus;
  documents: DocumentItem[];

  setAudio: (blob: Blob, durationSec?: number) => void;
  setAudioUrl: (url: string | null) => void;
  setAudioUploadStatus: (status: UploadStatus) => void;

  addDocument: (file: File) => string;
  setDocumentUrl: (id: string, url: string | null) => void;
  setDocumentUploadStatus: (id: string, status: UploadStatus) => void;
  removeDocument: (id: string) => void;

  reset: () => void;
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  audioBlob: null,
  audioUrl: null,
  audioUploadStatus: "idle",
  documents: [],

  setAudio: (blob) => set({ audioBlob: blob }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setAudioUploadStatus: (status) => set({ audioUploadStatus: status }),

  addDocument: (file) => {
    const id = makeId("doc");
    set((s) => ({
      documents: [
        ...s.documents,
        { id, file, url: null, uploadStatus: "idle" as const },
      ],
    }));
    return id;
  },
  setDocumentUrl: (id, url) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, url } : d)),
    })),
  setDocumentUploadStatus: (id, uploadStatus) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, uploadStatus } : d
      ),
    })),
  removeDocument: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  reset: () =>
    set({
      audioBlob: null,
      audioUrl: null,
      audioUploadStatus: "idle",
      documents: [],
    }),
}));

