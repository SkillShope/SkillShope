"use client";

import { useState, useEffect, useCallback } from "react";
import { Terminal } from "lucide-react";

export function TypingCommands({ commands }: { commands: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  const current = commands[index] || "";

  const tick = useCallback(() => {
    if (phase === "typing") {
      if (text.length < current.length) {
        setText(current.slice(0, text.length + 1));
      } else {
        setPhase("pause");
      }
    } else if (phase === "pause") {
      setPhase("deleting");
    } else if (phase === "deleting") {
      if (text.length > 0) {
        setText(text.slice(0, -1));
      } else {
        setIndex((i) => (i + 1) % commands.length);
        setPhase("typing");
      }
    }
  }, [phase, text, current, commands.length, index]);

  useEffect(() => {
    const delay =
      phase === "typing" ? 25 + Math.random() * 15 :
      phase === "pause" ? 1200 :
      12;
    const timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [tick, phase]);

  if (commands.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 font-mono text-sm sm:text-base">
      <Terminal className="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <span className="text-[var(--text-secondary)]">$</span>
      <span className="text-[var(--text)]">
        {text}
        <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] align-text-bottom animate-pulse" />
      </span>
    </div>
  );
}
