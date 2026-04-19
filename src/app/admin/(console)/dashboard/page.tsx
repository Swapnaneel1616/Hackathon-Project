"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Inbox, MapPin, Users } from "lucide-react";
import { CATEGORY_LABELS, sheltersForWarehouse } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

type Tab = "observe" | "requests";

export default function MasterAdminDashboardPage() {
  const {
    warehouses,
    phase,
    hoursToImpact,
    reservations,
    tickets,
    fundingRequests,
    resolveFundingRequest,
  } = useRelief();
  const [tab, setTab] = useState<Tab>("observe");
  const [grantInputs, setGrantInputs] = useState<Record<string, string>>({});

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const aggregates = useMemo(() => {
    const totals: Record<NutritionCategory, number> = {
      protein: 0,
      carbs: 0,
      fiber: 0,
      produce: 0,
      hydration: 0,
    };
    const caps: Record<NutritionCategory, number> = {
      protein: 0,
      carbs: 0,
      fiber: 0,
      produce: 0,
      hydration: 0,
    };
    for (const w of warehouses) {
      for (const c of cats) {
        totals[c] += w.categoryStock[c];
        caps[c] += w.categoryCaps[c];
      }
    }
    return { totals, caps };
  }, [warehouses, cats]);

  const activeRes = reservations.filter((r) => r.status === "active").length;
  const pendingTickets = tickets.filter((t) => t.status === "pending").length;
  const pendingFunds = fundingRequests.filter((f) => f.status === "pending");

  const phaseLabel =
    phase === "watch_pre"
      ? "Watch (pre-impact)"
      : phase === "watch_critical"
        ? "Watch (critical)"
        : phase === "during"
          ? "During impact"
          : "Post / recovery";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Master admin — observability</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Cross-hub disaster and food view plus funding decisions. Hub operators manage their own
          shelves, donations, and paid restocks from their console.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
        <button
          type="button"
          onClick={() => setTab("observe")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "observe"
              ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80"
              : "text-slate-600 hover:bg-amber-50/80 hover:text-amber-950"
          }`}
        >
          <Activity className="h-4 w-4" />
          Global charts
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "requests"
              ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80"
              : "text-slate-600 hover:bg-amber-50/80 hover:text-amber-950"
          }`}
        >
          <Inbox className="h-4 w-4" />
          My requests
          {pendingFunds.length > 0 && (
            <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-xs text-amber-100">
              {pendingFunds.length}
            </span>
          )}
        </button>
      </div>

      {tab === "observe" && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Disaster phase (demo)
              </div>
              <p className="mt-2 text-xl font-bold text-orange-200">{phaseLabel}</p>
              <p className="mt-1 text-xs text-slate-500">Hours-to-impact slider lives on resident demo dock.</p>
              <p className="mt-2 font-mono text-sm text-slate-300">T–{hoursToImpact}h</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase text-slate-500">Active reservations (all hubs)</div>
              <p className="mt-2 text-3xl font-bold text-teal-700">{activeRes}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase text-slate-500">Pending donation tickets</div>
              <p className="mt-2 text-3xl font-bold text-amber-800">{pendingTickets}</p>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              Regional food lanes (aggregate stock / aggregate cap)
            </h2>
            <div className="mt-6 space-y-4">
              {cats.map((c) => {
                const t = aggregates.totals[c];
                const cap = aggregates.caps[c] || 1;
                const pct = (t / cap) * 100;
                return (
                  <div key={c}>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>{CATEGORY_LABELS[c]}</span>
                      <span className="font-mono text-xs text-slate-500">
                        {t} / {cap}
                      </span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/85">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500/80 to-emerald-600/80"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Hub read-only snapshot
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {warehouses.map((w) => (
                <div key={w.id} className="rounded-xl border border-slate-200/90 bg-slate-50/95 p-4">
                  <div className="font-semibold text-slate-800">{w.name}</div>
                  <p className="text-[11px] text-slate-500">{w.address}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {cats.map((c) => (
                      <li key={c}>
                        {CATEGORY_LABELS[c]}:{" "}
                        <span className="font-mono text-slate-200">
                          {w.categoryStock[c]} / {w.categoryCaps[c]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-slate-200/80 pt-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <Users className="h-3.5 w-3.5" />
                      Shelter spokes (3)
                    </div>
                    <ul className="mt-2 space-y-2 text-[11px] text-slate-500">
                      {sheltersForWarehouse(w.id).map((s) => (
                        <li key={s.id} className="rounded-lg bg-white/60 px-2 py-1.5">
                          <span className="font-medium text-slate-800">{s.name}</span>
                          <span className="mx-1 text-slate-400">·</span>
                          <span className="text-slate-500">{s.address}</span>
                          <div className="mt-1 font-mono text-[10px] text-slate-400">
                            est. {s.headcount} on site · meals ≈ {s.estimatedMeals}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/hub/login"
                    className="mt-2 inline-block text-[11px] text-teal-300 hover:underline"
                  >
                    Hub operator login →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "requests" && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Funding requests from hubs</h2>
          <p className="text-sm text-slate-500">
            Approve to credit the hub wallet (you can change the granted amount). Reject closes the
            request with no transfer.
          </p>
          {pendingFunds.length === 0 && (
            <p className="text-sm text-slate-500">No pending requests.</p>
          )}
          <div className="space-y-3">
            {fundingRequests.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500">{r.id}</div>
                    <div className="font-semibold text-slate-800">{r.warehouseName}</div>
                    <div className="text-xs text-slate-400">
                      From <span className="font-mono">{r.hubEmail}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">${r.amount} requested</p>
                    <p className="mt-1 text-xs text-slate-500">{r.message}</p>
                  </div>
                  {r.status === "pending" ? (
                    <div className="flex flex-col gap-2 sm:items-end">
                      <label className="text-[11px] text-slate-500">
                        Grant (USD)
                        <input
                          type="number"
                          min={0}
                          className="ml-2 w-24 rounded border border-slate-200/90 bg-white/85 px-2 py-1 font-mono text-sm text-slate-800"
                          value={grantInputs[r.id] ?? String(r.amount)}
                          onChange={(e) =>
                            setGrantInputs((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const g = Number(grantInputs[r.id] ?? r.amount);
                            resolveFundingRequest(r.id, "approved", g);
                          }}
                          className="rounded-lg bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => resolveFundingRequest(r.id, "rejected")}
                          className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 ring-1 ring-rose-400/35"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold uppercase text-slate-400">
                      {r.status}
                      {r.grantAmount != null && r.status === "approved" && (
                        <span className="ml-2 font-mono text-emerald-300">+${r.grantAmount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
