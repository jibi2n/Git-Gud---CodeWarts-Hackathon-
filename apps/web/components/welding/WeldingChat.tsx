"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeldingProfileStore } from "@/stores/welding-profile-store";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "boses.weldingChat";

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && typeof m.content === "string");
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
}

export function WeldingChat() {
  const profile = useWeldingProfileStore((s) => s.profile);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (messages.length) saveHistory(messages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);
    setInput("");

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);

    try {
      const r = await fetch("/api/welding/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          profile,
        }),
      });
      if (!r.ok) throw new Error(`chat ${r.status}`);
      const data = (await r.json()) as { reply: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welding Assistant (Chat)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex max-h-[360px] flex-col gap-3 overflow-auto rounded-md border border-border bg-bg-default p-3">
          {messages.length === 0 && (
            <div className="text-[14px] text-fg-muted">
              Ask about welding jobs, certifications, or next steps.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-md px-3 py-2 text-[14px] leading-relaxed ${
                m.role === "user"
                  ? "self-end bg-accent-subtle text-accent-fg"
                  : "self-start bg-bg-subtle text-fg"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {error && (
          <div
            role="alert"
            className="mt-3 rounded-md border border-danger-emphasis bg-danger-subtle px-3 py-2 text-[14px] text-danger-fg"
          >
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full resize-none rounded-md border border-border bg-bg-default p-3 text-[14px]"
          rows={3}
          placeholder="Type your question…"
        />
        <Button
          size="lg"
          className="w-full min-h-[56px] text-[17px]"
          onClick={send}
          disabled={sending || input.trim().length === 0}
        >
          {sending ? "Sending…" : "Send"}
        </Button>
      </CardFooter>
    </Card>
  );
}

