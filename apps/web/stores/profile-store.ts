"use client";

import { create } from "zustand";
import type { Competency, JobSuggestion, ReadinessScore } from "@/types/api";

type ProfileState = {
  transcript: string | null;
  competencies: Competency[];
  rejectedIds: Set<string>;
  readiness: ReadinessScore | null;
  jobSuggestions: JobSuggestion[];

  setTranscript: (t: string) => void;
  setCompetencies: (c: Competency[]) => void;
  toggleReject: (id: string) => void;
  setScore: (r: ReadinessScore, jobs: JobSuggestion[]) => void;
  confirmedCompetencies: () => Competency[];
  reset: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  transcript: null,
  competencies: [],
  rejectedIds: new Set<string>(),
  readiness: null,
  jobSuggestions: [],

  setTranscript: (t) => set({ transcript: t }),
  setCompetencies: (c) => set({ competencies: c, rejectedIds: new Set() }),
  toggleReject: (id) =>
    set((s) => {
      const next = new Set(s.rejectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { rejectedIds: next };
    }),
  setScore: (r, jobs) => set({ readiness: r, jobSuggestions: jobs }),
  confirmedCompetencies: () => {
    const { competencies, rejectedIds } = get();
    return competencies.filter((c) => !rejectedIds.has(c.id));
  },
  reset: () =>
    set({
      transcript: null,
      competencies: [],
      rejectedIds: new Set(),
      readiness: null,
      jobSuggestions: [],
    }),
}));
