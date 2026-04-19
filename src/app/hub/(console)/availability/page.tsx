"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CATEGORY_LABELS, CATALOG } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

export default function HubAvailabilityPage() {
  const { hubSession, warehouses } = useRelief();
  const [revealed, setRevealed] = useState(false);
  const w = warehouses.find((x) => x.id === hubSession?.warehouseId);

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const itemsFor = (cat: NutritionCategory) => CATALOG.filter((i) => i.category === cat);

  if (!w) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My availability</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
          Shelf counts stay hidden until you deliberately reveal them — then you see each
          nutrition lane and catalog line items with the lane total beside them.
        </p>
      </div>

      {!revealed ? (
        <div className="glass flex flex-col items-center justify-center gap-4 rounded-3xl py-16 text-center">
          <EyeOff className="h-12 w-12 text-slate-600" aria-hidden />
          <p className="max-w-md text-sm leading-relaxed text-[var(--body-text)]">
            Resource numbers are not shown on this screen until you confirm you want to view
            internal availability.
          </p>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="btn-pitch-primary inline-flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-bold"
          >
            <Eye className="h-4 w-4" />
            Show resource availability
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="text-xs font-semibold text-[var(--reserve-green)] hover:underline"
          >
            Hide availability
          </button>
          {cats.map((cat) => {
            const laneTotal = w.categoryStock[cat];
            const items = itemsFor(cat);
            return (
              <section key={cat} className="glass rounded-2xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/90 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">{CATEGORY_LABELS[cat]}</h2>
                  <span className="rounded-full border border-[var(--field-green)]/35 bg-[rgba(73,120,188,0.14)] px-3 py-1 text-xs font-semibold text-[var(--reserve-green)]">
                    Lane total available:{" "}
                    <span className="font-mono tabular-nums text-[var(--earth-dark)]">{laneTotal}</span>
                  </span>
                </div>
                <ul className="mt-4 divide-y divide-[var(--reserve-green)]/10">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <span className="font-medium text-[var(--earth-dark)]">{item.name}</span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[var(--field-green)]">
                        {laneTotal}{" "}
                        <span className="text-xs font-sans font-medium text-[var(--caption-muted)]">
                          (lane)
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-[var(--reserve-green)]/10 pt-3 text-[11px] leading-relaxed text-[var(--body-text)]">
                  Demo model tracks stock by nutrition lane; each SKU row shows the shared lane
                  total your hub is allocating.
                </p>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
