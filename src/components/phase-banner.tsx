"use client";

import { AlertTriangle, CloudSnow, Home, Shield } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export function PhaseBanner() {
  const { phase, hoursToImpact } = useRelief();

  const meta =
    phase === "watch_pre"
      ? {
          icon: CloudSnow,
          title: "Pre-impact preparedness window",
          body: "Reserve balanced baskets, donate surplus, and let hubs rebalance stock before intake closes.",
          tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
        }
      : phase === "watch_critical"
        ? {
            icon: AlertTriangle,
            title: "Critical watch — warehouse intake closing soon",
            body: "Complete pickup reservations on time or holds release. Hubs stage convoys to shelter spokes.",
            tone: "border-amber-500/35 bg-amber-500/10 text-amber-100",
          }
        : phase === "during"
          ? {
              icon: Shield,
              title: "Hazard active — hub & spoke operations",
              body: "Government shelters and cloud-kitchen nodes stay live. Staff mode serves households without smartphones.",
              tone: "border-rose-500/35 bg-rose-500/10 text-rose-100",
            }
          : {
              icon: Home,
              title: "Recovery routing",
              body: "Scale-based split between warehouse coordination and shelter distribution until corridors normalize.",
              tone: "border-violet-500/35 bg-violet-500/10 text-violet-100",
            };

  const Icon = meta.icon;

  return (
    <div
      className={`flex flex-wrap items-start gap-3 rounded-2xl border px-4 py-3 ${meta.tone}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{meta.title}</p>
        <p className="mt-1 text-xs leading-relaxed opacity-90">{meta.body}</p>
      </div>
      <div className="shrink-0 rounded-xl bg-black/20 px-3 py-2 text-center font-mono text-xs">
        <div className="text-[10px] uppercase tracking-widest text-white/60">
          Countdown
        </div>
        <div className="text-lg font-bold text-white">{hoursToImpact}h</div>
      </div>
    </div>
  );
}
