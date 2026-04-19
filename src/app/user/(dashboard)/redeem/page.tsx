"use client";

import { useState } from "react";
import { Coins, ShoppingBag } from "lucide-react";
import { CategoryLanePill } from "@/components/category-lane-pill";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import { levelForCategory } from "@/lib/stock-utils";
import type { NutritionCategory } from "@/lib/types";

const costFor = (lvl: ReturnType<typeof levelForCategory>) =>
  lvl === "red" ? 25 : lvl === "yellow" ? 15 : 10;

export default function UserRedeemPage() {
  const {
    user,
    warehouses,
    sortedWarehouses,
    redeemBonusItem,
    startWarehouseVisit,
    bonusRedeemedThisVisit,
  } = useRelief();
  const [whId, setWhId] = useState("");
  const hubId = whId || sortedWarehouses[0]?.id || "";
  const [note, setNote] = useState<string | null>(null);

  const w = warehouses.find((x) => x.id === hubId);
  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const tryRedeem = (c: NutritionCategory) => {
    if (!hubId) return;
    setNote(null);
    const r = redeemBonusItem({ warehouseId: hubId, category: c });
    setNote(r.ok ? `Redeemed 1× ${CATEGORY_LABELS[c]} lane bonus.` : r.reason);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Redeem at hub</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          One bonus item per visit — higher scarcity lanes cost more points.
        </p>
      </div>

      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-lg">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Wallet
            </div>
            <div className="font-mono text-3xl font-bold text-amber-800">
              {user?.points ?? 0}
              <span className="ml-2 text-sm font-normal text-slate-500">pts</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            startWarehouseVisit();
            setNote("Visit mode reset — you can redeem one bonus this trip.");
          }}
          className="rounded-xl border border-slate-200/90 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          Simulate new warehouse visit
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 rounded-3xl p-6">
          <label className="block text-sm font-medium text-slate-300">
            Hub for redemption
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200/90 bg-white/85 px-3 py-2.5 text-sm text-slate-800 outline-none"
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
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lane pricing (live)
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {cats.map((c) => {
                  const lvl = levelForCategory(w, c);
                  const cost = costFor(lvl);
                  const affordable = (user?.points ?? 0) >= cost;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!affordable || bonusRedeemedThisVisit}
                      onClick={() => tryRedeem(c)}
                      className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/95 p-4 text-left transition hover:border-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <CategoryLanePill category={c} level={lvl} />
                      </div>
                      <span className="font-mono text-lg text-teal-700">
                        {cost} pts
                      </span>
                      <span className="text-[10px] text-slate-500">
                        stock in lane: {w.categoryStock[c]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="glass flex flex-col justify-between rounded-3xl p-6">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShoppingBag className="h-5 w-5 text-violet-300" />
              Visit rules
            </div>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-400">
              <li>Red lane bonus costs 25 pts · Yellow 15 · Green 10.</li>
              <li>Max one bonus redemption per simulated visit.</li>
            </ul>
          </div>
          {bonusRedeemedThisVisit && (
            <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
              Bonus slot used — tap “Simulate new warehouse visit” to reset.
            </div>
          )}
          {note && (
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              {note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
