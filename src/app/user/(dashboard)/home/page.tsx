"use client";

import Link from "next/link";
import { memo } from "react";
import { ChevronRight, Gauge, Package } from "lucide-react";
import { CategoryLanePill } from "@/components/category-lane-pill";
import { PhaseBanner } from "@/components/phase-banner";
import { WarehouseMap } from "@/components/warehouse-map";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import { levelForCategory, redSeverityScore } from "@/lib/stock-utils";
import type { NutritionCategory, Warehouse } from "@/lib/types";

const HubRow = memo(function HubRow({ w, cats }: { w: Warehouse; cats: NutritionCategory[] }) {
  return (
    <Link
      href={`/user/warehouse/${w.id}`}
      className="glass group flex flex-col gap-3 rounded-2xl p-4 transition hover:border-cyan-500/30 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-white">{w.name}</h3>
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            severity {redSeverityScore(w)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{w.address}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <CategoryLanePill key={c} category={c} level={levelForCategory(w, c)} />
          ))}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
    </Link>
  );
});

export default function UserHomePage() {
  const { user, sortedWarehouses, reservations, tickets } = useRelief();
  const top = sortedWarehouses[0];
  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const activeRes = reservations.filter((r) => r.status === "active").length;
  const myEmail = user?.email.toLowerCase() ?? "";
  const myPendingDonations = tickets.filter(
    (t) => t.donorEmail.toLowerCase() === myEmail && t.status === "pending",
  ).length;

  return (
    <div className="space-y-8">
      <PhaseBanner />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Gauge className="h-4 w-4 text-cyan-400" />
            Household
          </div>
          <p className="mt-2 text-3xl font-bold text-white">
            {user?.householdSize}{" "}
            <span className="text-lg font-medium text-slate-500">people</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Allotments scale per nutrition lane automatically.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your active holds
          </div>
          <p className="mt-2 text-3xl font-bold text-cyan-200">{activeRes}</p>
          <p className="mt-1 text-xs text-slate-500">
            One-hour holds from registration; unused stock returns automatically.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your donation tickets
          </div>
          <p className="mt-2 text-3xl font-bold text-violet-200">{myPendingDonations}</p>
          <p className="mt-1 text-xs text-slate-500">
            Pending at the warehouse desk — credits apply after admin closes the
            ticket.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Hub urgency queue</h2>
            <p className="text-sm text-slate-400">
              Lane colors show which nutrient categories need attention at each
              hub.
            </p>
          </div>
          <div className="space-y-3">
            {sortedWarehouses.map((w) => (
              <HubRow key={w.id} w={w} cats={cats} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Coverage map</h2>
          <WarehouseMap warehouses={sortedWarehouses} />
          {top && (
            <div className="glass rounded-2xl p-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-white">
                <Package className="h-4 w-4 text-rose-300" />
                Highest-pressure hub
              </div>
              <p className="mt-2 font-medium text-slate-200">{top.name}</p>
              <p className="mt-1 text-xs">
                Prioritize donor convoys and UN bulk drops here first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
