"use client";

import { useRelief } from "@/context/relief-context";
import type { TicketStatus } from "@/lib/types";

function fmtTicket(ts: number) {
  const diff = ts - Date.now();
  if (diff <= 0) return "elapsed";
  const m = Math.ceil(diff / 60_000);
  if (m >= 120) return `in ~${Math.round(m / 60)}h`;
  return `in ~${m}m`;
}

export default function HubDonationsPage() {
  const { hubSession, tickets, setTicketStatus } = useRelief();
  const mine = tickets.filter((t) => t.warehouseId === hubSession?.warehouseId);

  const act = (id: string, s: TicketStatus) => setTicketStatus(id, s);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Donation tickets</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
          Resident-submitted in-kind tickets for your hub only. Close to credit their wallet.
        </p>
      </div>
      <div className="space-y-3">
        {mine.length === 0 && (
          <p className="text-sm text-slate-500">No tickets for this hub yet.</p>
        )}
        {mine.map((t) => (
          <div
            key={t.id}
            className="glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-mono text-[10px] text-slate-500">{t.id}</div>
              <div className="font-semibold text-slate-800">{t.warehouseName}</div>
              <div className="text-xs text-[var(--body-text)]">
                Donor: {t.donorDisplayName}{" "}
                <span className="text-[var(--caption-muted)]">({t.donorEmail})</span>
              </div>
              <div className="mt-1 text-xs text-[var(--body-text)]">
                {t.lines.map((l) => `${l.name}×${l.qty}`).join(", ")} · +{t.expectedPoints} pts on
                close · {t.status} · {fmtTicket(t.expiresAt)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => act(t.id, "accepted")}
                    className="rounded-lg border border-[var(--harvest-amber)]/45 bg-[rgba(232,184,75,0.2)] px-3 py-1.5 text-xs font-semibold text-[#5c4a12] ring-1 ring-[var(--harvest-amber)]/30"
                  >
                    Accepted (desk)
                  </button>
                  <button
                    type="button"
                    onClick={() => act(t.id, "closed")}
                    className="rounded-lg border border-[var(--field-green)]/45 bg-[rgba(73,120,188,0.18)] px-3 py-1.5 text-xs font-semibold text-[var(--reserve-green)] ring-1 ring-[var(--field-green)]/25"
                  >
                    Close + credit
                  </button>
                </>
              )}
              {t.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => act(t.id, "closed")}
                  className="rounded-lg border border-[var(--field-green)]/45 bg-[rgba(73,120,188,0.18)] px-3 py-1.5 text-xs font-semibold text-[var(--reserve-green)] ring-1 ring-[var(--field-green)]/25"
                >
                  Close + credit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
