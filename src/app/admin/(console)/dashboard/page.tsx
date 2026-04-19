"use client";

import { useState } from "react";
import Link from "next/link";
import { ChefHat, Package, Ticket as TicketIcon, Users } from "lucide-react";
import { CATEGORY_LABELS, SHELTERS } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

function fmtTicket(ts: number) {
  const diff = ts - Date.now();
  if (diff <= 0) return "elapsed";
  const m = Math.ceil(diff / 60_000);
  if (m >= 120) return `in ~${Math.round(m / 60)}h`;
  return `in ~${m}m`;
}

export default function AdminDashboardPage() {
  const { warehouses, tickets, setTicketStatus, updateWarehouseStock } =
    useRelief();
  const [saved, setSaved] = useState(false);

  const bumpStock = (
    warehouseId: string,
    cat: NutritionCategory,
    delta: number,
  ) => {
    const w = warehouses.find((x) => x.id === warehouseId);
    if (!w) return;
    const next = w.categoryStock[cat] + delta;
    updateWarehouseStock(warehouseId, { [cat]: next });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const setStock = (warehouseId: string, cat: NutritionCategory, raw: string) => {
    const v = Number(raw);
    if (Number.isNaN(v)) return;
    updateWarehouseStock(warehouseId, { [cat]: v });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white">Operations</h1>
        <p className="mt-2 text-sm text-slate-400">
          Adjust lane stock, close donation tickets to credit residents, monitor
          shelter spokes.
        </p>
        {saved && (
          <p className="mt-2 text-xs font-medium text-emerald-300">Inventory saved.</p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Package className="h-5 w-5 text-orange-400" />
          Inventory by hub
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {warehouses.map((w) => (
            <div key={w.id} className="glass rounded-3xl p-6">
              <h3 className="font-semibold text-white">{w.name}</h3>
              <p className="text-xs text-slate-500">{w.address}</p>
              <div className="mt-4 space-y-2">
                {cats.map((c) => (
                  <div
                    key={c}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                  >
                    <span className="min-w-[100px] text-xs text-slate-300">
                      {CATEGORY_LABELS[c]}
                    </span>
                    <input
                      type="number"
                      className="w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-sm text-white"
                      defaultValue={w.categoryStock[c]}
                      key={`${w.id}-${c}-${w.categoryStock[c]}`}
                      onBlur={(e) => setStock(w.id, c, e.target.value)}
                    />
                    <span className="text-[10px] text-slate-500">
                      cap {w.categoryCaps[c]}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button
                        type="button"
                        className="rounded bg-white/10 px-2 py-0.5 text-xs text-white"
                        onClick={() => bumpStock(w.id, c, -50)}
                      >
                        −50
                      </button>
                      <button
                        type="button"
                        className="rounded bg-orange-500/20 px-2 py-0.5 text-xs text-orange-100"
                        onClick={() => bumpStock(w.id, c, 50)}
                      >
                        +50
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <TicketIcon className="h-5 w-5 text-violet-400" />
          Donation tickets
        </h2>
        <div className="space-y-3">
          {tickets.length === 0 && (
            <p className="text-sm text-slate-500">No tickets yet.</p>
          )}
          {tickets.map((t) => (
            <div
              key={t.id}
              className="glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-mono text-[10px] text-slate-500">{t.id}</div>
                <div className="font-semibold text-white">{t.warehouseName}</div>
                <div className="text-xs text-slate-400">
                  Donor: {t.donorDisplayName}{" "}
                  <span className="text-slate-500">({t.donorEmail})</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {t.lines.map((l) => `${l.name}×${l.qty}`).join(", ")} · +{t.expectedPoints}{" "}
                  pts on close · {t.status} · {fmtTicket(t.expiresAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTicketStatus(t.id, "accepted")}
                      className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/40"
                    >
                      Accepted (desk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTicketStatus(t.id, "closed")}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                    >
                      Close + credit
                    </button>
                  </>
                )}
                {t.status === "accepted" && (
                  <button
                    type="button"
                    onClick={() => setTicketStatus(t.id, "closed")}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                  >
                    Close + credit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <ChefHat className="h-5 w-5 text-orange-300" />
          Shelter spokes
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SHELTERS.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-4 text-sm text-slate-400">
              <div className="font-semibold text-white">{s.name}</div>
              <p className="mt-1 text-xs">{s.address}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="h-3.5 w-3.5" /> est. {s.headcount}
                </span>
                <span>Meals ≈ {s.estimatedMeals}</span>
              </div>
              <Link
                href={`/user/warehouse/${s.warehouseId}`}
                className="mt-2 inline-block text-xs text-cyan-300 hover:underline"
              >
                View linked hub (resident app)
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
