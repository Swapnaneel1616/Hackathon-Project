"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Inbox, MapPin, Users } from "lucide-react";
import { CATEGORY_LABELS, sheltersForWarehouse } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import type { NutritionCategory } from "@/lib/types";

type Tab = "observe" | "requests";
type RegionUnit = {
  id: string;
  name: string;
  fundingUsd: number;
  stock: Record<NutritionCategory, number>;
  cap: Record<NutritionCategory, number>;
};
type RegionCard = {
  id: string;
  name: string;
  units: RegionUnit[];
};

export default function MasterAdminDashboardPage() {
  const {
    warehouses,
    phase,
    hoursToImpact,
    reservations,
    tickets,
    fundingRequests,
    resolveFundingRequest,
  } = useRelief();
  const [tab, setTab] = useState<Tab>("observe");
  const [grantInputs, setGrantInputs] = useState<Record<string, string>>({});
  const [selectedRegionId, setSelectedRegionId] = useState("region-1");
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const cats = Object.keys(CATEGORY_LABELS) as NutritionCategory[];

  const regions = useMemo<RegionCard[]>(() => {
    const regionOneUnits: RegionUnit[] = warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      fundingUsd: 28_000,
      stock: w.categoryStock,
      cap: w.categoryCaps,
    }));
    const emptyLane = () =>
      ({
        protein: 0,
        carbs: 0,
        fiber: 0,
        produce: 0,
        hydration: 0,
      }) as Record<NutritionCategory, number>;
    const mockUnit = (id: string, name: string, seed: number): RegionUnit => {
      const stock = emptyLane();
      const cap = emptyLane();
      for (const c of cats) {
        const capVal = 600 + seed * 90;
        const ratioBase = 0.3 + ((seed * 7 + c.length * 3) % 45) / 100;
        cap[c] = capVal;
        stock[c] = Math.round(capVal * Math.min(0.92, ratioBase));
      }
      return {
        id,
        name,
        fundingUsd: 18_000 + seed * 2_500,
        stock,
        cap,
      };
    };

    return [
      { id: "region-1", name: "Region 1", units: regionOneUnits },
      {
        id: "region-2",
        name: "Region 2",
        units: [mockUnit("r2-u1", "Westfield Relief Unit", 2), mockUnit("r2-u2", "Lakepoint Aid Unit", 3)],
      },
      {
        id: "region-3",
        name: "Region 3",
        units: [mockUnit("r3-u1", "Hilltop Nutrition Unit", 4), mockUnit("r3-u2", "Central Depot Unit", 5)],
      },
      {
        id: "region-4",
        name: "Region 4",
        units: [mockUnit("r4-u1", "Ridgeway Distribution Unit", 6), mockUnit("r4-u2", "Valley Base Unit", 7)],
      },
      {
        id: "region-5",
        name: "Region 5",
        units: [mockUnit("r5-u1", "Harborline Response Unit", 8), mockUnit("r5-u2", "Southport Supply Unit", 9)],
      },
      {
        id: "region-6",
        name: "Region 6",
        units: [mockUnit("r6-u1", "Pinecrest Recovery Unit", 10), mockUnit("r6-u2", "Delta Grid Unit", 11)],
      },
    ];
  }, [warehouses, cats]);
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) ?? regions[0];
  const selectedUnit = selectedRegion?.units.find((u) => u.id === selectedUnitId) ?? selectedRegion?.units[0];

  const selectedRegionAggregates = useMemo(() => {
    const totals = {
      protein: 0,
      carbs: 0,
      fiber: 0,
      produce: 0,
      hydration: 0,
    } as Record<NutritionCategory, number>;
    const caps = {
      protein: 0,
      carbs: 0,
      fiber: 0,
      produce: 0,
      hydration: 0,
    } as Record<NutritionCategory, number>;
    if (!selectedRegion) return { totals, caps };
    for (const unit of selectedRegion.units) {
      for (const c of cats) {
        totals[c] += unit.stock[c];
        caps[c] += unit.cap[c];
      }
    }
    return { totals, caps };
  }, [cats, selectedRegion]);

  const activeRes = reservations.filter((r) => r.status === "active").length;
  const pendingTickets = tickets.filter((t) => t.status === "pending").length;
  const pendingFunds = fundingRequests.filter((f) => f.status === "pending");

  const phaseLabel =
    phase === "watch_pre"
      ? "Watch (pre-impact)"
      : phase === "watch_critical"
        ? "Watch (critical)"
        : phase === "during"
          ? "During impact"
          : "Post / recovery";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Master admin — observability</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Cross-hub disaster and food view plus funding decisions. Hub operators manage their own
          shelves, donations, and paid restocks from their console.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
        <button
          type="button"
          onClick={() => setTab("observe")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "observe"
              ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80"
              : "text-slate-600 hover:bg-amber-50/80 hover:text-amber-950"
          }`}
        >
          <Activity className="h-4 w-4" />
          Global charts
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "requests"
              ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80"
              : "text-slate-600 hover:bg-amber-50/80 hover:text-amber-950"
          }`}
        >
          <Inbox className="h-4 w-4" />
          My requests
          {pendingFunds.length > 0 && (
            <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-xs text-amber-100">
              {pendingFunds.length}
            </span>
          )}
        </button>
      </div>

      {tab === "observe" && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Disaster phase (demo)
              </div>
              <p className="mt-2 text-xl font-bold text-orange-200">{phaseLabel}</p>
              <p className="mt-1 text-xs text-slate-500">Hours-to-impact slider lives on resident demo dock.</p>
              <p className="mt-2 font-mono text-sm text-slate-300">T–{hoursToImpact}h</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase text-slate-500">Active reservations (all hubs)</div>
              <p className="mt-2 text-3xl font-bold text-teal-700">{activeRes}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase text-slate-500">Pending donation tickets</div>
              <p className="mt-2 text-3xl font-bold text-amber-800">{pendingTickets}</p>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              Regional nutrition intelligence
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a region card, then a unit, to inspect nutrition delivery performance and funding-linked capacity.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {regions.map((region) => {
                const isSelected = region.id === selectedRegion?.id;
                const totalUnits = region.units.length;
                const funded = region.units.reduce((sum, u) => sum + u.fundingUsd, 0);
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegionId(region.id);
                      setSelectedUnitId(region.units[0]?.id ?? "");
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[var(--field-green)]/50 bg-[rgba(73,120,188,0.12)]"
                        : "border-slate-200/80 bg-white/70 hover:border-[var(--field-green)]/35"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-800">{region.name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{totalUnits} units tracked</p>
                    <p className="mt-1 font-mono text-[11px] text-[var(--field-green)]">${funded.toLocaleString()} funding</p>
                  </button>
                );
              })}
            </div>

            {selectedRegion && (
              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selected region</p>
                    <p className="text-lg font-bold text-slate-800">{selectedRegion.name}</p>
                  </div>
                  <label className="text-xs text-slate-600">
                    Select unit
                    <select
                      className="ml-2 rounded-lg border border-slate-200/90 bg-white px-2 py-1 text-xs text-slate-800"
                      value={selectedUnit?.id ?? ""}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                    >
                      {selectedRegion.units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {cats.map((c) => {
                    const stock = selectedUnit?.stock[c] ?? 0;
                    const cap = selectedUnit?.cap[c] ?? 1;
                    const pct = Math.min(100, Math.round((stock / cap) * 100));
                    return (
                      <div key={c} className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-3 text-center">
                        <div
                          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-xs font-bold text-slate-800"
                          style={{
                            background: `conic-gradient(#22c55e ${pct * 3.6}deg, #e2e8f0 ${pct * 3.6}deg 360deg)`,
                          }}
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">{pct}%</div>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700">{CATEGORY_LABELS[c]}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">
                          {stock} / {cap}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200/70 bg-white px-3 py-2">
                    Unit funding:{" "}
                    <span className="font-mono font-semibold text-[var(--field-green)]">
                      ${(selectedUnit?.fundingUsd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200/70 bg-white px-3 py-2">
                    Region units: <span className="font-semibold text-slate-800">{selectedRegion.units.length}</span>
                  </div>
                  <div className="rounded-lg border border-slate-200/70 bg-white px-3 py-2">
                    Region fill avg:{" "}
                    <span className="font-mono font-semibold text-slate-800">
                      {Math.round(
                        (cats.reduce((sum, c) => {
                          const cap = selectedRegionAggregates.caps[c] || 1;
                          return sum + (selectedRegionAggregates.totals[c] / cap) * 100;
                        }, 0) || 0) / cats.length,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              Selected region aggregate lanes
            </h2>
            <div className="space-y-4">
              {cats.map((c) => {
                const t = selectedRegionAggregates.totals[c];
                const cap = selectedRegionAggregates.caps[c] || 1;
                const pct = (t / cap) * 100;
                return (
                  <div key={c}>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>{CATEGORY_LABELS[c]}</span>
                      <span className="font-mono text-xs text-slate-500">
                        {t} / {cap}
                      </span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/85">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500/80 to-emerald-600/80"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Hub read-only snapshot
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {warehouses.map((w) => (
                <div key={w.id} className="rounded-xl border border-slate-200/90 bg-slate-50/95 p-4">
                  <div className="font-semibold text-slate-800">{w.name}</div>
                  <p className="text-[11px] text-slate-500">{w.address}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {cats.map((c) => (
                      <li key={c}>
                        {CATEGORY_LABELS[c]}:{" "}
                        <span className="font-mono text-slate-200">
                          {w.categoryStock[c]} / {w.categoryCaps[c]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-slate-200/80 pt-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <Users className="h-3.5 w-3.5" />
                      Shelter spokes (3)
                    </div>
                    <ul className="mt-2 space-y-2 text-[11px] text-slate-500">
                      {sheltersForWarehouse(w.id).map((s) => (
                        <li key={s.id} className="rounded-lg bg-white/60 px-2 py-1.5">
                          <span className="font-medium text-slate-800">{s.name}</span>
                          <span className="mx-1 text-slate-400">·</span>
                          <span className="text-slate-500">{s.address}</span>
                          <div className="mt-1 font-mono text-[10px] text-slate-400">
                            est. {s.headcount} on site · meals ≈ {s.estimatedMeals}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/hub/login"
                    className="mt-2 inline-block text-[11px] text-teal-300 hover:underline"
                  >
                    Hub operator login →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "requests" && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Funding requests from hubs</h2>
          <p className="text-sm text-slate-500">
            Approve to credit the hub wallet (you can change the granted amount). Reject closes the
            request with no transfer.
          </p>
          {pendingFunds.length === 0 && (
            <p className="text-sm text-slate-500">No pending requests.</p>
          )}
          <div className="space-y-3">
            {fundingRequests.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500">{r.id}</div>
                    <div className="font-semibold text-slate-800">{r.warehouseName}</div>
                    <div className="text-xs text-slate-400">
                      From <span className="font-mono">{r.hubEmail}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">${r.amount} requested</p>
                    <p className="mt-1 text-xs text-slate-500">{r.message}</p>
                  </div>
                  {r.status === "pending" ? (
                    <div className="flex flex-col gap-2 sm:items-end">
                      <label className="text-[11px] text-slate-500">
                        Grant (USD)
                        <input
                          type="number"
                          min={0}
                          className="ml-2 w-24 rounded border border-slate-200/90 bg-white/85 px-2 py-1 font-mono text-sm text-slate-800"
                          value={grantInputs[r.id] ?? String(r.amount)}
                          onChange={(e) =>
                            setGrantInputs((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const g = Number(grantInputs[r.id] ?? r.amount);
                            resolveFundingRequest(r.id, "approved", g);
                          }}
                          className="rounded-lg bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => resolveFundingRequest(r.id, "rejected")}
                          className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 ring-1 ring-rose-400/35"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold uppercase text-slate-400">
                      {r.status}
                      {r.grantAmount != null && r.status === "approved" && (
                        <span className="ml-2 font-mono text-emerald-300">+${r.grantAmount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
