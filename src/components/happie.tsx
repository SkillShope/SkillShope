"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Loader2, Download, FileCode } from "lucide-react";
import Image from "next/image";
import { Markdown } from "./markdown";
import { onHappieOpen } from "@/lib/happie-state";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Happie() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedSkill, setGeneratedSkill] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Listen for external open events (e.g., from search bar)
  useEffect(() => {
    return onHappieOpen((message) => {
      setOpen(true);
      setInput(message);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, []);

  // Cmd+K to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/happie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: { currentPage: pathname },
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting. Try again in a moment." },
      ]);
    }

    setLoading(false);
  };

  const generateSkill = async () => {
    setGenerating(true);
    setGeneratedSkill(null);
    try {
      const res = await fetch("/api/happie/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, projectName: "My Project" }),
      });
      const data = await res.json();
      if (data.requiresAuth) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I can create a tailored SKILL.md for your project from our conversation! [Create an account or sign in](/auth/signin) so we can get started.",
          },
        ]);
      } else if (data.skill) {
        setGeneratedSkill(data.skill);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Couldn't generate the skill. Try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Couldn't generate the skill. Try again." },
      ]);
    }
    setGenerating(false);
  };

  const downloadSkill = () => {
    if (!generatedSkill) return;
    const blob = new Blob([generatedSkill], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] shadow-lg transition-transform hover:scale-105"
          title="Ask Happie (⌘K)"
        >
          <Image src="/logo.png" alt="Happie" width={28} height={28} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l border-[var(--border)] bg-[var(--bg)] md:bottom-6 md:right-6 md:h-[600px] md:w-[420px] md:rounded-2xl md:border md:shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Happie" width={20} height={20} />
                <span className="font-display text-sm font-bold">Happie</span>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  AI Assistant
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Image src="/logo.png" alt="Happie" width={40} height={40} className="mb-4 opacity-40" />
                  <p className="mb-2 text-sm font-medium">
                    Happie to Help!
                  </p>
                  <p className="mb-6 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Tell me what you&apos;re building and I&apos;ll recommend
                    the right skills, MCP servers, and agents.
                  </p>
                  <div className="space-y-2">
                    {[
                      "I'm building a Next.js app with Postgres",
                      "What MCP servers are available?",
                      "Help me find SEO tools",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="block w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text)] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Markdown content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mb-3 text-left">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-secondary)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Generate skill / Download */}
            {messages.length >= 2 && !generatedSkill && (
              <div className="border-t border-[var(--border)] px-4 py-2">
                <button
                  onClick={generateSkill}
                  disabled={generating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating your skill...
                    </>
                  ) : (
                    <>
                      <FileCode className="h-3.5 w-3.5" />
                      Generate a SKILL.md for my project
                    </>
                  )}
                </button>
              </div>
            )}
            {generatedSkill && (
              <div className="border-t border-[var(--border)] px-4 py-2">
                <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/5 p-3">
                  <p className="mb-2 text-xs font-medium">Your personal skill is ready</p>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadSkill}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download SKILL.md
                    </button>
                    <button
                      onClick={() => setGeneratedSkill(null)}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Describe what you're building..."
                  maxLength={2000}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--text-secondary)]/50">
                ⌘K to toggle · Happie may make mistakes
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
