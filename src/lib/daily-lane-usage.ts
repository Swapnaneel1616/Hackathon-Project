import type { NutritionCategory, Reservation } from "./types";

/** Local calendar day key (YYYY-MM-DD) for daily lane caps. */
export function localDateKey(ts: number = Date.now()): string {
  return new Date(ts).toLocaleDateString("en-CA");
}

/** Qty already committed today per lane (active + fulfilled holds created today). */
export function dailyLaneUsageFromReservations(
  reservations: Reservation[],
  residentEmail: string,
  calendarDay: string,
): Record<NutritionCategory, number> {
  const email = residentEmail.toLowerCase();
  const out: Record<NutritionCategory, number> = {
    protein: 0,
    carbs: 0,
    fiber: 0,
    produce: 0,
    hydration: 0,
  };
  for (const r of reservations) {
    if ((r.residentEmail ?? "").toLowerCase() !== email) continue;
    if (localDateKey(r.createdAt) !== calendarDay) continue;
    if (r.status !== "active" && r.status !== "fulfilled") continue;
    for (const l of r.lines) {
      out[l.category] += l.qty;
    }
  }
  return out;
}
