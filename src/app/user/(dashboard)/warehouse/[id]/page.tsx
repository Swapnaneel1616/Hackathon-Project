"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Clock, MapPin } from "lucide-react";
import { CategoryLanePill } from "@/components/category-lane-pill";
import { ReservationHoldCountdown } from "@/components/reservation-hold-countdown";
import {
  ALLOTMENT_PER_HOUSEHOLD,
  CATALOG,
  CATEGORY_LABELS,
} from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import { isHubReservationIntakeClosed } from "@/lib/shelter-gate";
import { dailyLaneUsageFromReservations, localDateKey } from "@/lib/daily-lane-usage";
import { levelForCategory } from "@/lib/stock-utils";
import type { NutritionCategory } from "@/lib/types";

export default function UserWarehousePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { user, warehouses, createReservation, reservations, phase, hoursToImpact } =
    useRelief();
  const hubIntakeClosed = isHubReservationIntakeClosed(phase, hoursToImpact);

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

  const dailyUsed = useMemo(() => {
    if (!user) {
      return {
        protein: 0,
        carbs: 0,
        fiber: 0,
        produce: 0,
        hydration: 0,
      } as Record<NutritionCategory, number>;
    }
    return dailyLaneUsageFromReservations(
      reservations,
      user.email.toLowerCase(),
      localDateKey(),
    );
  }, [reservations, user]);

  if (!w) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-slate-600">
        Warehouse not found.{" "}
        <Link href="/user/home" className="text-[var(--field-green)] hover:underline">
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
    setQty(Object.fromEntries(CATALOG.map((i) => [i.id, 0])));
    try {
      sessionStorage.setItem("reliefHub_pendingOrderSuccess", "1");
    } catch {
      /* ignore */
    }
    router.push("/user/reservations");
  };

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];
  const email = (user?.email ?? "").toLowerCase();
  const myReservations = reservations.filter(
    (r) => (r.residentEmail ?? "").toLowerCase() === email,
  );
  const activeHoldsHere = myReservations.filter(
    (r) => r.warehouseId === w.id && r.status === "active",
  );
  const showInlineActiveHold = myReservations.length < 2;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/home"
            className="text-xs font-semibold text-[var(--field-green)] hover:text-[var(--reserve-green)]"
          >
            ← All hubs
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">{w.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-[var(--field-green)]" />
            {w.address}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {cats.map((c) => (
            <CategoryLanePill key={c} category={c} level={levelForCategory(w, c)} />
          ))}
        </div>
      </div>

      {hubIntakeClosed && (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--alert-terracotta)]/35 bg-[rgba(194,90,53,0.08)] px-4 py-3 text-sm text-[var(--earth-dark)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--alert-terracotta)]" />
          <div>
            <p className="font-semibold text-slate-900">Hub self-serve intake is closed</p>
            <p className="mt-1 leading-relaxed text-slate-700">
              During active disaster coordination, new basket reservations from this hub are
              paused so inventory can move to shelter spokes. Check the{" "}
              <Link href="/user/shelter" className="font-semibold text-[var(--field-green)] hover:underline">
                Shelter
              </Link>{" "}
              tab for official sites. Existing holds (if any) still follow their countdown.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className={`glass space-y-4 rounded-3xl p-6 ${hubIntakeClosed ? "opacity-60" : ""}`}
          aria-disabled={hubIntakeClosed}
        >
          <h2 className="text-lg font-bold text-slate-800">Reserve balanced basket</h2>
          <p className="text-sm text-slate-600">
            Each nutrition lane has a daily household cap (all hubs combined for
            today). Active holds and fulfilled pickups count toward today until
            midnight. Stock is also limited by what this hub has on hand. Hold
            starts when you confirm — default 1 hour.
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={judgeFast}
              disabled={hubIntakeClosed}
              onChange={(e) => setJudgeFast(e.target.checked)}
            />
            Quick demo: ~3 minute hold (uncheck for 1-hour hold)
          </label>

          <div className="space-y-3">
            {CATALOG.map((item) => {
              const lim = limits[item.category];
              const usedCat = used[item.category];
              const alreadyToday = dailyUsed[item.category];
              const maxForItem = Math.max(
                0,
                Math.min(
                  lim - alreadyToday - (usedCat - (qty[item.id] || 0)),
                  w.categoryStock[item.category],
                ),
              );
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.description} ·{" "}
                      <span className="text-[var(--field-green)]">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={hubIntakeClosed}
                      className="rounded-lg border border-slate-200/80 bg-slate-100/90 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200/90 disabled:pointer-events-none disabled:opacity-40"
                      onClick={() => setOne(item.id, (qty[item.id] || 0) - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={maxForItem}
                      value={qty[item.id] || 0}
                      disabled={hubIntakeClosed}
                      onChange={(e) =>
                        setOne(item.id, Number(e.target.value) || 0)
                      }
                      className="w-14 rounded-lg border border-slate-200/90 bg-white/85 px-2 py-1 text-center font-mono text-sm text-slate-800 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={hubIntakeClosed}
                      className="rounded-lg border border-slate-200/80 bg-slate-100/90 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200/90 disabled:pointer-events-none disabled:opacity-40"
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
            disabled={hubIntakeClosed}
            className="btn-pitch-primary w-full rounded-2xl py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm reservation
          </button>
          {msg && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--alert-terracotta)]/35 bg-[rgba(194,90,53,0.08)] px-3 py-2 text-xs text-[var(--earth-dark)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--alert-terracotta)]" />
              {msg}
            </div>
          )}

          {showInlineActiveHold && activeHoldsHere.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/90 pt-4">
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
            <h3 className="font-bold text-slate-800">Lane budgets (today)</h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Includes this basket plus your other active or fulfilled reservations
              created today (local calendar day).
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(limits) as NutritionCategory[]).map((c) => (
                <li
                  key={c}
                  className="flex justify-between border-b border-slate-200/70 py-2 text-slate-700"
                >
                  <span>{CATEGORY_LABELS[c]}</span>
                  <span className="font-mono text-xs text-[var(--field-green)]">
                    {dailyUsed[c] + used[c]} / {limits[c]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-6 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-amber-600" />
              Hold policy
            </div>
            <p className="mt-2 leading-relaxed">
              Timer runs from the moment you register items (default 1 hour). There
              is no separate pickup window in this flow — arrive before the hold
              expires. If a hold expires, today&apos;s lane counts drop so you can
              try again the same day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
