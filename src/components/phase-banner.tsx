"use client";

import { AlertTriangle, CloudSnow, Home, Shield } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export function PhaseBanner() {
  const { phase, hoursToImpact } = useRelief();

  const meta =
    phase === "watch_pre"
      ? {
          icon: CloudSnow,
          chip: "Before · Prepare",
          title: "Pre-impact preparedness window",
          body: "Reserve balanced baskets, donate surplus, and let hubs rebalance stock before intake closes.",
            bar: "border-l-[5px] border-l-[var(--field-green)] bg-[rgba(245,240,232,0.95)]",
        }
      : phase === "watch_critical"
        ? {
            icon: AlertTriangle,
            chip: "Early warning · Active",
            title: "Critical watch — intake closing soon",
            body: "Complete holds on time or stock returns to the commons. Harvest amber signals urgency without panic.",
            bar: "border-l-[5px] border-l-[var(--harvest-amber)] bg-[rgba(245,240,232,0.98)]",
          }
        : phase === "during"
          ? {
              icon: Shield,
              chip: "During · Crisis routing",
              title: "Hazard active — hub & spoke operations",
              body: "Terracotta marks live crisis coordination: shelters and hubs share one operational rhythm.",
              bar: "border-l-[5px] border-l-[var(--alert-terracotta)] bg-[rgba(245,240,232,0.97)]",
            }
          : {
              icon: Home,
              chip: "After · Recover",
              title: "Recovery routing",
              body: "Replenish, learn, and adapt until corridors normalize — split between warehouse and shelter spokes.",
              bar: "border-l-[5px] border-l-[#6b8faf] bg-[rgba(245,240,232,0.96)]",
            };

  const Icon = meta.icon;

  return (
    <div
      className={`flex flex-wrap items-start gap-3 rounded-2xl border border-[var(--reserve-green)]/10 pl-4 pr-4 py-3 shadow-sm ${meta.bar}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--field-green)]" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--caption-muted)]">
          {meta.chip}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--earth-dark)]">{meta.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--body-text)]">{meta.body}</p>
      </div>
      <div className="shrink-0 rounded-xl border border-[var(--reserve-green)]/12 bg-white/80 px-3 py-2 text-center shadow-inner">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--caption-muted)]">
          Countdown
        </div>
        <div className="text-lg font-bold tabular-nums text-[var(--reserve-green)]">{hoursToImpact}h</div>
      </div>
    </div>
  );
}
