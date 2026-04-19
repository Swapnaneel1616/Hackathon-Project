"use client";

import { RotateCcw, Smartphone } from "lucide-react";
import { useRelief } from "@/context/relief-context";
import type { DisasterPhase } from "@/lib/types";

const phases: { id: DisasterPhase; label: string }[] = [
  { id: "watch_pre", label: "Before · prepare" },
  { id: "watch_critical", label: "Warning · closing" },
  { id: "during", label: "During · crisis" },
  { id: "post", label: "After · recover" },
];

export function DemoControlDock() {
  const { phase, setPhase, hoursToImpact, setHoursToImpact, resetDemo } = useRelief();

  return (
    <div className="glass fixed bottom-4 left-1/2 z-50 w-[min(96vw,42rem)] -translate-x-1/2 rounded-2xl border border-[var(--reserve-green)]/12 px-4 py-3 text-sm text-[var(--body-text)] shadow-xl shadow-[var(--reserve-green)]/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--field-green)]">
          <Smartphone className="h-4 w-4 text-[var(--reserve-green)]" />
          Demo controls
        </div>
        <button
          type="button"
          onClick={() => resetDemo()}
          className="btn-brand-secondary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhase(p.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              phase === p.id
                ? "bg-[var(--reserve-green)] text-[#f5faf6] shadow-md ring-1 ring-[var(--reserve-green)]/40"
                : "border border-[var(--reserve-green)]/12 bg-white/80 text-[var(--body-text)] hover:border-[var(--field-green)]/40 hover:bg-[rgba(73,120,188,0.12)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-[11px] text-[var(--caption-muted)]">
          Hours to impact (countdown UX)
          <input
            type="range"
            min={0}
            max={168}
            value={hoursToImpact}
            onChange={(e) => setHoursToImpact(Number(e.target.value))}
            className="accent-[var(--field-green)]"
          />
        </label>
        <span className="rounded-md border border-[var(--reserve-green)]/12 bg-white/90 px-2 py-1 font-mono text-xs font-semibold text-[var(--reserve-green)]">
          T−{hoursToImpact}h
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-[var(--caption-muted)]">
        SMS fallback + NGO broadcast can be wired to Twilio; this UI simulates phase shifts for
        judges.
      </p>
    </div>
  );
}
