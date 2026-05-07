"use client";

import { WeldingChat } from "@/components/welding/WeldingChat";

export default function WeldingChatPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight">
          Chat
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-fg-muted">
          Ask welding-specific questions. Uses a server-side OpenAI integration when configured.
        </p>
      </header>
      <WeldingChat />
    </main>
  );
}

