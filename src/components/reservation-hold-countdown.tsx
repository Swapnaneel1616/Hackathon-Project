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
  const summary = reservation.lines.map((l) => `${l.name}×${l.qty}`).join(", ");

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        expired
          ? "border-slate-200/90 bg-slate-100/90 text-slate-500"
          : "border-[var(--field-green)]/35 bg-gradient-to-br from-[rgba(73,120,188,0.1)] to-[rgba(158,197,239,0.22)] text-[var(--earth-dark)] shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2">
        <Timer
          className={`mt-0.5 h-4 w-4 shrink-0 ${expired ? "text-slate-400" : "text-[var(--field-green)]"}`}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className={`text-[11px] leading-snug ${expired ? "text-slate-500" : "text-[var(--body-text)]"}`}>
            <span className="font-semibold text-slate-800">Held for you</span> until{" "}
            <span className="font-mono text-[var(--reserve-green)] tabular-nums">
              {formatUntil24h(reservation.createdAt, reservation.expiresAt)}
            </span>{" "}
            (24h clock from registration — no separate pickup slot).
          </p>
          <p className="text-[10px] text-slate-600">{summary}</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Time left
            </span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                expired ? "text-slate-400" : "text-[var(--field-green)]"
              }`}
            >
              {expired ? "0:00" : formatRemaining(remainingMs)}
            </span>
            {!expired && remainingMs < 5 * 60_000 && (
              <span className="text-[10px] font-semibold text-amber-700">Pick up soon</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
