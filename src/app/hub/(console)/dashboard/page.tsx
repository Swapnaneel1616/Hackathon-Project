"use client";

import Link from "next/link";
import { AlertTriangle, Package, Ticket } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

export default function HubDashboardPage() {
  const { hubSession, warehouses, tickets, reservations } = useRelief();
  const w = warehouses.find((x) => x.id === hubSession?.warehouseId);
  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const myTickets = tickets.filter((t) => t.warehouseId === hubSession?.warehouseId);
  const pendingDonations = myTickets.filter((t) => t.status === "pending").length;
  const myRes = reservations.filter(
    (r) => r.warehouseId === hubSession?.warehouseId && r.status === "active",
  ).length;

  if (!w) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{w.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{w.address}</p>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          Process resident donation tickets, reveal shelf availability when needed, purchase
          stock from your hub wallet, and request more funds from the master admin if the
          wallet runs dry.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Ticket className="h-4 w-4 text-amber-400" />
            Pending donation tickets
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-800">{pendingDonations}</p>
          <Link
            href="/hub/donations"
            className="mt-2 inline-block text-xs font-semibold text-[var(--reserve-green)] hover:underline"
          >
            Open donation queue →
          </Link>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active reservations here
          </div>
          <p className="mt-2 text-3xl font-bold text-[var(--field-green)]">{myRes}</p>
          <p className="mt-2 text-xs text-slate-500">Residents holding inventory at this hub.</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Lanes under cap
          </div>
          <p className="mt-2 text-3xl font-bold text-rose-800">
            {cats.filter((c) => w.categoryStock[c] < w.categoryCaps[c] * 0.15).length}
          </p>
          <p className="mt-2 text-xs text-slate-500">Below 15% of lane capacity — consider restock.</p>
        </div>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Package className="h-5 w-5 text-[var(--field-green)]" />
          Quick lane snapshot
        </h2>
        <p className="mt-1 text-xs text-[var(--body-text)]">
          For full numbers, open{" "}
          <Link className="font-semibold text-[var(--reserve-green)] hover:underline" href="/hub/availability">
            My availability
          </Link>{" "}
          and click to reveal.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => {
            const pct = w.categoryCaps[c] ? (w.categoryStock[c] / w.categoryCaps[c]) * 100 : 0;
            return (
              <div
                key={c}
                className="rounded-xl border border-[var(--field-green)]/25 bg-[rgba(73,120,188,0.08)] px-3 py-2"
              >
                <div className="text-xs font-semibold text-[var(--earth-dark)]">{CATEGORY_LABELS[c]}</div>
                <div className="mt-1 font-mono text-sm font-medium text-[var(--reserve-green)]">
                  {w.categoryStock[c]} / {w.categoryCaps[c]}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/85">
                  <div
                    className="h-full rounded-full bg-[var(--field-green)]"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
