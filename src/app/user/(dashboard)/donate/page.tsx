"use client";

import { useMemo, useState } from "react";
import { Gift, MapPinned, Sparkles } from "lucide-react";
import { CategoryLanePill } from "@/components/category-lane-pill";
import { CATALOG, CATEGORY_LABELS } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import { levelForCategory } from "@/lib/stock-utils";
import type { NutritionCategory } from "@/lib/types";
import { DONATION_POINTS_BASE } from "@/lib/types";

export default function UserDonatePage() {
  const { user, sortedWarehouses, createDonationTicket, warehouses } =
    useRelief();

  const [whId, setWhId] = useState("");
  const hubId = whId || sortedWarehouses[0]?.id || "";
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATALOG.map((i) => [i.id, 0])),
  );
  const [msg, setMsg] = useState<string | null>(null);

  const w = warehouses.find((x) => x.id === hubId);

  const lines = useMemo(
    () =>
      CATALOG.map((item) => ({
        item,
        qty: qty[item.id] || 0,
      })).filter((l) => l.qty > 0),
    [qty],
  );

  const expected =
    hubId && lines.length
      ? (() => {
          const ww = warehouses.find((x) => x.id === hubId);
          if (!ww) return 0;
          let pts = 0;
          for (const l of lines) {
            const lvl = levelForCategory(ww, l.item.category);
            pts += DONATION_POINTS_BASE[lvl] * l.qty;
          }
          return Math.round(pts);
        })()
      : 0;

  const setOne = (itemId: string, next: number) => {
    setQty((q) => ({ ...q, [itemId]: Math.max(0, Math.floor(next)) }));
  };

  const checkout = () => {
    setMsg(null);
    if (!hubId) {
      setMsg("Pick a hub first.");
      return;
    }
    if (!lines.length) {
      setMsg("Add at least one donation line.");
      return;
    }
    createDonationTicket({ warehouseId: hubId, lines });
    setMsg(
      `Ticket created — bring goods to ${w?.name}. Admin will verify; then +${expected} pts.`,
    );
    setQty(Object.fromEntries(CATALOG.map((i) => [i.id, 0])));
  };

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Donor desk</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Warehouse admins accept tickets and credit your account. Lane colors
          show which nutrient categories need help most.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass space-y-4 rounded-3xl p-6 lg:col-span-2">
          <label className="block text-sm font-medium text-slate-300">
            Destination hub
            <select
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none"
              value={hubId}
              onChange={(e) => setWhId(e.target.value)}
            >
              {sortedWarehouses.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </label>

          {w && (
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-black/20 p-3">
              <MapPinned className="h-4 w-4 text-cyan-400" />
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{w.name}</span>{" "}
                — credit multipliers by lane:
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cats.map((c) => (
                    <CategoryLanePill key={c} category={c} level={levelForCategory(w, c)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {CATALOG.map((item) => {
              const lvl = w ? levelForCategory(w, item.category) : "green";
              const pts = DONATION_POINTS_BASE[lvl];
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {CATEGORY_LABELS[item.category]} ·{" "}
                      <span className="text-emerald-200/90">
                        +{pts} pts / unit if donated now
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
                      onClick={() => setOne(item.id, (qty[item.id] || 0) - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty[item.id] || 0}
                      onChange={(e) =>
                        setOne(item.id, Number(e.target.value) || 0)
                      }
                      className="w-14 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-center font-mono text-sm text-white"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
                      onClick={() => setOne(item.id, (qty[item.id] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={checkout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            <Gift className="h-4 w-4" />
            Create donation ticket
          </button>
          {msg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {msg}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Checkout preview
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Credits apply after warehouse admin closes the ticket.
            </p>
            <div className="mt-4 rounded-2xl bg-black/30 p-4 font-mono text-2xl font-bold text-cyan-200">
              +{expected}
              <span className="ml-2 text-xs font-normal text-slate-500">
                expected pts
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Current wallet:{" "}
              <span className="text-slate-300">{user?.points ?? 0} pts</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
