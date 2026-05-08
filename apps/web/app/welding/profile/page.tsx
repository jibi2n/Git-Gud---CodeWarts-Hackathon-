"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useWeldingProfileStore } from "@/stores/welding-profile-store";
import {
  WELDING_LOCATION_PRESETS,
  WELDING_SPECIALIZATIONS,
} from "@/lib/welding-demo-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WeldingProfilePage() {
  const profile = useWeldingProfileStore((s) => s.profile);
  const setField = useWeldingProfileStore((s) => s.setField);
  const addSkill = useWeldingProfileStore((s) => s.addSkill);
  const removeSkill = useWeldingProfileStore((s) => s.removeSkill);
  const toggleSpecialization = useWeldingProfileStore((s) => s.toggleSpecialization);

  const [skillDraft, setSkillDraft] = useState("");

  const locationLabel = profile.location?.label ?? "Not set";

  const selectedSpecs = useMemo(() => new Set(profile.specializations), [profile.specializations]);

  async function onPickPhoto(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      setField("photoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          Welding Profile
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          Demo profile (saved locally on this device).
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="text-[14px]">
              <div className="mb-1 text-fg-muted">Full name</div>
              <input
                value={profile.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                className="w-full rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
              />
            </label>
            <label className="text-[14px]">
              <div className="mb-1 text-fg-muted">Phone</div>
              <input
                value={profile.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
              />
            </label>
            <label className="text-[14px]">
              <div className="mb-1 text-fg-muted">Email</div>
              <input
                value={profile.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
              />
            </label>
            <label className="text-[14px]">
              <div className="mb-1 text-fg-muted">Short bio</div>
              <textarea
                value={profile.bio}
                onChange={(e) => setField("bio", e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
                rows={3}
              />
            </label>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Photo & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {profile.photoDataUrl ? (
              <Image
                src={profile.photoDataUrl}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-md border border-border bg-bg-subtle" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void onPickPhoto(e.target.files?.[0] ?? null)}
              className="block w-full text-[14px]"
            />

            <label className="flex items-center gap-3 text-[16px]">
              <input
                type="checkbox"
                checked={profile.isPublic}
                onChange={(e) => setField("isPublic", e.target.checked)}
                className="size-5 accent-accent-emphasis"
              />
              Public profile
            </label>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-[14px] text-fg-muted">Current: {locationLabel}</div>
            <div className="grid grid-cols-1 gap-2">
              {WELDING_LOCATION_PRESETS.map((p) => (
                <Button
                  key={p.id}
                  variant={profile.location?.id === p.id ? "default" : "secondary"}
                  onClick={() => setField("location", p)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <label className="text-[14px]">
              <div className="mb-1 text-fg-muted">Search radius (miles)</div>
              <input
                type="number"
                value={profile.radiusMiles}
                onChange={(e) => setField("radiusMiles", Number(e.target.value))}
                className="w-full rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
                min={5}
                max={50}
              />
            </label>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                className="flex-1 rounded-md border border-border bg-bg-default px-3 py-2 text-[16px]"
                placeholder="e.g., blueprint reading"
              />
              <Button
                onClick={() => {
                  addSkill(skillDraft);
                  setSkillDraft("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 && (
                <div className="text-[14px] text-fg-muted">No skills added yet.</div>
              )}
              {profile.skills.map((s) => (
                <button
                  key={s}
                  onClick={() => removeSkill(s)}
                  className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-[13px]"
                  aria-label={`Remove ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {WELDING_SPECIALIZATIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialization(s)}
                className={`rounded-full border px-3 py-1 text-[13px] ${
                  selectedSpecs.has(s)
                    ? "border-accent-emphasis bg-accent-subtle text-accent-fg"
                    : "border-border bg-bg-default text-fg"
                }`}
              >
                {s}
              </button>
            ))}
            {profile.specializations.length > 0 && (
              <div className="mt-3 w-full">
                <Badge variant="secondary">
                  Selected: {profile.specializations.length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
