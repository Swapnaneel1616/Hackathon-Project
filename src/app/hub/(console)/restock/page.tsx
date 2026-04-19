"use client";

import { useState } from "react";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { RESTOCK_COST_PER_UNIT } from "@/lib/hub-accounts";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

export default function HubRestockPage() {
  const { hubSession, warehouses, hubFunds, purchaseHubStock } = useRelief();
  const w = warehouses.find((x) => x.id === hubSession?.warehouseId);
  const [qty, setQty] = useState<Partial<Record<NutritionCategory, string>>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];
  const balance = hubSession ? (hubFunds[hubSession.warehouseId] ?? 0) : 0;

  const submit = (cat: NutritionCategory) => {
    if (!hubSession) return;
    setMsg(null);
    const n = Math.floor(Number(qty[cat] ?? 0));
    const r = purchaseHubStock(hubSession.warehouseId, cat, n);
    if (!r.ok) {
      setMsg(r.reason);
      return;
    }
    setMsg(`Added ${r.added} units to ${CATEGORY_LABELS[cat]} — charged $${r.cost}.`);
    setQty((q) => ({ ...q, [cat]: "" }));
  };

  if (!w || !hubSession) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add stock (paid)</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
          Each unit you add debits your hub wallet at the lane rate below. If funds are low, use{" "}
          <strong className="text-[var(--reserve-green)]">My fundings</strong> to request more from the master
          admin.
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--reserve-green)]">Wallet balance: ${balance}</p>
      </div>
      {msg && (
        <div className="rounded-xl border border-[var(--field-green)]/35 bg-[rgba(73,120,188,0.1)] px-3 py-2 text-sm font-medium text-[var(--earth-dark)]">
          {msg}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {cats.map((cat) => {
          const unit = RESTOCK_COST_PER_UNIT[cat];
          const room = w.categoryCaps[cat] - w.categoryStock[cat];
          const q = Math.max(0, Math.floor(Number(qty[cat] ?? 0)));
          const est = q * unit;
          return (
            <div key={cat} className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800">{CATEGORY_LABELS[cat]}</h3>
              <p className="mt-1 text-xs text-slate-500">
                Shelf {w.categoryStock[cat]} / cap {w.categoryCaps[cat]} · room {room} · $
                {unit}/unit
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="text-xs text-slate-400">
                  Units to add
                  <input
                    type="number"
                    min={0}
                    className="mt-1 block w-28 rounded-lg border border-slate-200/90 bg-white/85 px-2 py-1.5 font-mono text-sm text-slate-800"
                    value={qty[cat] ?? ""}
                    onChange={(e) =>
                      setQty((prev) => ({ ...prev, [cat]: e.target.value }))
                    }
                  />
                </label>
                <span className="text-xs text-slate-500">Est. ${est}</span>
                <button
                  type="button"
                  onClick={() => submit(cat)}
                  className="rounded-lg border border-[var(--reserve-green)]/25 bg-[var(--reserve-green)] px-3 py-2 text-xs font-semibold text-[#f5faf6] shadow-sm hover:brightness-110"
                >
                  Purchase &amp; add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
