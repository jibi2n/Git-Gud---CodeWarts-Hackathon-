"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Consent = {
  voice: boolean;
  image: boolean;
  timestamp: string | null;
};

type SessionState = {
  sessionId: string | null;
  phoneNumber: string | null;
  consent: Consent;
  setSession: (id: string, phone: string) => void;
  grantConsent: (kind: "voice" | "image", value: boolean) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      phoneNumber: null,
      consent: { voice: false, image: false, timestamp: null },
      setSession: (id, phone) => set({ sessionId: id, phoneNumber: phone }),
      grantConsent: (kind, value) =>
        set((s) => ({
          consent: {
            ...s.consent,
            [kind]: value,
            timestamp:
              value && (s.consent.voice || s.consent.image)
                ? s.consent.timestamp
                : value
                ? new Date().toISOString()
                : s.consent.timestamp,
          },
        })),
      reset: () =>
        set({
          sessionId: null,
          phoneNumber: null,
          consent: { voice: false, image: false, timestamp: null },
        }),
    }),
    {
      name: "boses.session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
