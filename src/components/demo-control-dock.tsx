"use client";

import { RotateCcw, Smartphone } from "lucide-react";
import { useRelief } from "@/context/relief-context";
import type { DisasterPhase } from "@/lib/types";

const phases: { id: DisasterPhase; label: string }[] = [
  { id: "watch_pre", label: "Watch · days 1–6" },
  { id: "watch_critical", label: "<12h · hub closing" },
  { id: "during", label: "During · shelter spokes" },
  { id: "post", label: "Post · split routing" },
];

export function DemoControlDock() {
  const {
    phase,
    setPhase,
    hoursToImpact,
    setHoursToImpact,
    resetDemo,
  } = useRelief();

  return (
    <div className="glass fixed bottom-4 left-1/2 z-50 w-[min(96vw,42rem)] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm text-slate-200 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-cyan-300/90">
          <Smartphone className="h-4 w-4" />
          Demo controls
        </div>
        <button
          type="button"
          onClick={() => resetDemo()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
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
                ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-[11px] text-slate-400">
          Hours to impact (countdown UX)
          <input
            type="range"
            min={0}
            max={168}
            value={hoursToImpact}
            onChange={(e) => setHoursToImpact(Number(e.target.value))}
            className="accent-cyan-400"
          />
        </label>
        <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-cyan-200">
          T−{hoursToImpact}h
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-500">
        SMS fallback + NGO broadcast can be wired to Twilio; this UI simulates
        phase shifts for judges.
      </p>
    </div>
  );
}
