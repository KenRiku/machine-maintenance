"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

const STARTERS = [
  "What are the most common failure modes for this machine?",
  "I hear a grinding noise during startup. Walk me through troubleshooting.",
  "What's a reasonable PM cadence for a machine of this type?",
  "Help me diagnose: oil leaking near the base.",
];

export default function AssistantTab({
  machine,
  initialMessages,
}: {
  machine: { id: string; name: string; type: string; model: string };
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setError(null);
    setSending(true);
    const userMsg: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    try {
      const res = await fetch(`/api/machines/${machine.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((m) => [
        ...m.filter((x) => x.id !== userMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (err: any) {
      setError(err?.message || "Chat failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="panel flex flex-col h-[640px]">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-signal-green rounded-full pulse-line" />
            <div>
              <div className="display-type text-base text-ink-100">
                Repair Assistant
              </div>
              <div className="mono text-[10px] text-ink-300 uppercase tracking-[0.2em]">
                context-loaded · {machine.name}
              </div>
            </div>
          </div>
          <span className="chip-info">Beta</span>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
        >
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="display-type text-lg text-ink-100 mb-2">
                Ask about this machine.
              </div>
              <p className="text-ink-300 text-sm max-w-md mx-auto">
                The assistant has this machine's specs and service history
                already loaded. For safety-critical procedures, always confirm
                against OEM documentation.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={`max-w-[80%] px-4 py-3 ${
                  m.role === "user"
                    ? "bg-rust-500 text-black"
                    : "bg-ink-800 text-ink-100 border border-white/5"
                }`}
              >
                <div className="mono text-[9px] uppercase tracking-[0.25em] mb-1 opacity-70">
                  {m.role === "user" ? "Operator" : "Assistant"}
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 bg-ink-800 border border-white/5">
                <div className="mono text-[9px] uppercase tracking-[0.25em] mb-1 opacity-70">
                  Assistant
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-rust-400 pulse-line" />
                  <span
                    className="w-1.5 h-1.5 bg-rust-400 pulse-line"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-rust-400 pulse-line"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-5 py-2 text-sm text-signal-red border-t border-white/5">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-white/5 p-3 flex gap-2"
        >
          <input
            className="input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the issue in plain language…"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn-primary"
          >
            Send
          </button>
        </form>
      </div>

      <aside className="panel p-5">
        <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-4">
          Suggested questions
        </div>
        <div className="space-y-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={sending}
              className="text-left w-full text-sm text-ink-200 hover:text-ink-100 border border-white/5 hover:border-rust-400/40 px-3 py-3 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-2">
            Safety
          </div>
          <p className="text-xs text-ink-400 leading-relaxed">
            AI output is guidance, not OEM instruction. Always verify
            safety-critical procedures against the manufacturer's manual and
            lockout / tagout protocols.
          </p>
        </div>
      </aside>
    </div>
  );
}
