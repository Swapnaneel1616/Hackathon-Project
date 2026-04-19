"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import type { Reservation } from "@/lib/types";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

/** 24-hour clock, e.g. 23:53 (no AM/PM). If hold crosses midnight, show short date. */
function formatUntil24h(createdAt: number, expiresAt: number) {
  const end = new Date(expiresAt);
  const startDay = new Date(createdAt).toDateString();
  const endDay = end.toDateString();
  const time = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (startDay !== endDay) {
    return `${end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} ${time}`;
  }
  return time;
}

export function ReservationHoldCountdown({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = reservation.expiresAt - now;
  const expired = remainingMs <= 0;
  const summary = reservation.lines
    .map((l) => `${l.name}×${l.qty}`)
    .join(", ");

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        expired
          ? "border-white/10 bg-white/5 text-slate-500"
          : "border-cyan-500/35 bg-cyan-950/50 text-cyan-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <Timer
          className={`mt-0.5 h-4 w-4 shrink-0 ${expired ? "text-slate-500" : "text-cyan-400"}`}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] leading-snug text-slate-300">
            <span className="font-semibold text-white">Held for you</span> until{" "}
            <span className="font-mono text-cyan-200 tabular-nums">
              {formatUntil24h(reservation.createdAt, reservation.expiresAt)}
            </span>{" "}
            (24h clock from registration — no separate pickup slot).
          </p>
          <p className="text-[10px] text-slate-500">{summary}</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Time left
            </span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                expired ? "text-slate-500" : "text-cyan-300"
              }`}
            >
              {expired ? "0:00" : formatRemaining(remainingMs)}
            </span>
            {!expired && remainingMs < 5 * 60_000 && (
              <span className="text-[10px] font-semibold text-amber-300">
                Pick up soon
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
