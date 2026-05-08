"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ModulesPage() {
  const items = [
    {
      title: "Welding Profile",
      href: "/welding/profile",
      body: "Edit your info, location, specializations, and privacy settings.",
    },
    {
      title: "Job Matcher",
      href: "/welding/jobs",
      body: "Synthetic nearby welding jobs + interactive markers (demo map).",
    },
    {
      title: "Career Advice",
      href: "/welding/advice",
      body: "Welding-only demo guidance: certs, training, business ideas.",
    },
    {
      title: "Chat Assistant",
      href: "/welding/chat",
      body: "Ask welding-specific questions with conversation history.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          Modules
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          Demo expansion modules (welding-focused).
        </p>
      </header>

      <section className="flex flex-col gap-3">
        {items.map((it) => (
          <Card key={it.href} size="sm">
            <CardHeader>
              <CardTitle>{it.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-[16px] text-fg-muted">{it.body}</p>
              <Link
                href={it.href}
                className={cn(
                  buttonVariants({ size: "lg", variant: "default" }),
                  "w-full min-h-[56px] text-[17px]"
                )}
              >
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
