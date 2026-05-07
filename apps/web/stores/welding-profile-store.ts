"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WeldingLocationPreset = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

export type WeldingProfile = {
  fullName: string;
  phone: string;
  email: string;
  bio: string;
  location: WeldingLocationPreset | null;
  radiusMiles: number;
  skills: string[];
  specializations: string[];
  isPublic: boolean;
  photoDataUrl: string | null;
};

type WeldingProfileState = {
  profile: WeldingProfile;
  setField: <K extends keyof WeldingProfile>(key: K, value: WeldingProfile[K]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  toggleSpecialization: (spec: string) => void;
  reset: () => void;
};

const DEFAULT: WeldingProfile = {
  fullName: "",
  phone: "",
  email: "",
  bio: "",
  location: null,
  radiusMiles: 50,
  skills: [],
  specializations: [],
  isPublic: false,
  photoDataUrl: null,
};

export const useWeldingProfileStore = create<WeldingProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT,
      setField: (key, value) =>
        set((s) => ({ profile: { ...s.profile, [key]: value } })),
      addSkill: (skill) => {
        const trimmed = skill.trim();
        if (!trimmed) return;
        set((s) => ({
          profile: {
            ...s.profile,
            skills: Array.from(new Set([...s.profile.skills, trimmed])),
          },
        }));
      },
      removeSkill: (skill) =>
        set((s) => ({
          profile: {
            ...s.profile,
            skills: s.profile.skills.filter((x) => x !== skill),
          },
        })),
      toggleSpecialization: (spec) => {
        const { profile } = get();
        const setSpec = new Set(profile.specializations);
        if (setSpec.has(spec)) setSpec.delete(spec);
        else setSpec.add(spec);
        set({ profile: { ...profile, specializations: Array.from(setSpec) } });
      },
      reset: () => set({ profile: DEFAULT }),
    }),
    {
      name: "boses.weldingProfile",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

