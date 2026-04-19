"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, Clock, MapPin } from "lucide-react";
import { CategoryLanePill } from "@/components/category-lane-pill";
import { ReservationHoldCountdown } from "@/components/reservation-hold-countdown";
import {
  ALLOTMENT_PER_HOUSEHOLD,
  CATALOG,
  CATEGORY_LABELS,
} from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import { levelForCategory } from "@/lib/stock-utils";
import type { NutritionCategory } from "@/lib/types";

export default function UserWarehousePage() {
  const params = useParams();
  const id = String(params.id);
  const { user, warehouses, createReservation, reservations } = useRelief();

  const w = warehouses.find((x) => x.id === id);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATALOG.map((i) => [i.id, 0])),
  );
  const [judgeFast, setJudgeFast] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const limits = useMemo(() => {
    const hh = user?.householdSize ?? 1;
    const out: Record<NutritionCategory, number> = {
      protein: 0,
      carbs: 0,
      fiber: 0,
      produce: 0,
      hydration: 0,
    };
    (Object.keys(out) as NutritionCategory[]).forEach((c) => {
      out[c] = ALLOTMENT_PER_HOUSEHOLD[c] * hh;
    });
    return out;
  }, [user?.householdSize]);

  if (!w) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-slate-400">
        Warehouse not found.{" "}
        <Link href="/user/home" className="text-cyan-300 hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const used: Record<NutritionCategory, number> = {
    protein: 0,
    carbs: 0,
    fiber: 0,
    produce: 0,
    hydration: 0,
  };
  CATALOG.forEach((i) => {
    used[i.category] += qty[i.id] || 0;
  });

  const setOne = (itemId: string, next: number) => {
    const item = CATALOG.find((x) => x.id === itemId);
    if (!item) return;
    setQty((q) => ({ ...q, [itemId]: Math.max(0, Math.floor(next)) }));
  };

  const submit = () => {
    setMsg(null);
    const lines = CATALOG.map((item) => ({
      item,
      qty: qty[item.id] || 0,
    })).filter((l) => l.qty > 0);
    if (!lines.length) {
      setMsg("Select at least one line item.");
      return;
    }
    const holdHours = judgeFast ? 0.05 : 1;
    const res = createReservation({
      warehouseId: w.id,
      lines,
      holdHours,
    });
    if (!res.ok) {
      setMsg(res.reason);
      return;
    }
    setMsg(
      judgeFast
        ? "Reservation locked (demo TTL)."
        : "Reservation locked for 1 hour from now. Countdown below — no pickup slot.",
    );
    setQty(Object.fromEntries(CATALOG.map((i) => [i.id, 0])));
  };

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];
  const activeHoldsHere = reservations.filter(
    (r) => r.warehouseId === w.id && r.status === "active",
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/home"
            className="text-xs font-semibold text-cyan-300/80 hover:text-cyan-200"
          >
            ← All hubs
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">{w.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-4 w-4 text-cyan-400" />
            {w.address}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {cats.map((c) => (
            <CategoryLanePill key={c} category={c} level={levelForCategory(w, c)} />
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass space-y-4 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white">Reserve balanced basket</h2>
          <p className="text-sm text-slate-400">
            Quantities are capped per household and live stock. Hold starts when
            you confirm — default 1 hour.
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={judgeFast}
              onChange={(e) => setJudgeFast(e.target.checked)}
            />
            Quick demo: ~3 minute hold (uncheck for 1-hour hold)
          </label>

          <div className="space-y-3">
            {CATALOG.map((item) => {
              const lim = limits[item.category];
              const usedCat = used[item.category];
              const maxForItem = Math.max(
                0,
                Math.min(
                  lim - (usedCat - (qty[item.id] || 0)),
                  w.categoryStock[item.category],
                ),
              );
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.description} ·{" "}
                      <span className="text-cyan-200/80">
                        {CATEGORY_LABELS[item.category]}
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
                      max={maxForItem}
                      value={qty[item.id] || 0}
                      onChange={(e) =>
                        setOne(item.id, Number(e.target.value) || 0)
                      }
                      className="w-14 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-center font-mono text-sm text-white"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
                      onClick={() =>
                        setOne(item.id, Math.min(maxForItem, (qty[item.id] || 0) + 1))
                      }
                    >
                      +
                    </button>
                    <span className="text-[10px] text-slate-500">max {maxForItem}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={submit}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Confirm reservation
          </button>
          {msg && (
            <div className="flex items-start gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {msg}
            </div>
          )}

          {activeHoldsHere.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Active hold · live countdown
              </p>
              {activeHoldsHere.map((r) => (
                <ReservationHoldCountdown key={r.id} reservation={r} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white">Lane budgets (household)</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(limits) as NutritionCategory[]).map((c) => (
                <li
                  key={c}
                  className="flex justify-between border-b border-white/5 py-2 text-slate-300"
                >
                  <span>{CATEGORY_LABELS[c]}</span>
                  <span className="font-mono text-xs text-cyan-200">
                    {used[c]} / {limits[c]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-6 text-sm text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Clock className="h-4 w-4 text-amber-300" />
              Hold policy
            </div>
            <p className="mt-2 leading-relaxed">
              Timer runs from the moment you register items (default 1 hour). There
              is no separate pickup window in this flow — arrive before the hold
              expires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
