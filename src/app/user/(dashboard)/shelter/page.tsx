"use client";

import Link from "next/link";
import { AlertTriangle, Home, Shield } from "lucide-react";
import { CATEGORY_LABELS, sheltersForWarehouse } from "@/lib/mock-data";
import { useRelief } from "@/context/relief-context";
import {
  isHubReservationIntakeClosed,
  isShelterIntelUnlocked,
  SHELTER_INTEL_UNLOCK_HOURS,
} from "@/lib/shelter-gate";
import type { NutritionCategory, ShelterNode, Warehouse } from "@/lib/types";

function foodAvailabilityLine(w: Warehouse) {
  return (Object.keys(CATEGORY_LABELS) as NutritionCategory[])
    .map((c) => `${CATEGORY_LABELS[c]} ${w.categoryStock[c]}`)
    .join(" · ");
}

function ShelterDetailCard({
  s,
  hub,
  hubIntakeClosed,
}: {
  s: ShelterNode;
  hub: Warehouse | undefined;
  hubIntakeClosed: boolean;
}) {
  const occPct =
    s.ratedCapacity > 0 ? Math.min(100, Math.round((s.headcount / s.ratedCapacity) * 100)) : 0;
  return (
    <li className="glass rounded-2xl border border-[var(--line)] p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-[var(--earth-dark)]">{s.name}</h3>
        <span className="shrink-0 rounded-full bg-[rgba(73,120,188,0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--reserve-green)]">
          Open board
        </span>
      </div>
      <p className="mt-1 flex items-start gap-1.5 text-xs text-[var(--caption-muted)]">
        <Home className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--field-green)]" />
        {s.address}
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-[var(--reserve-green)]/10 pb-2">
          <dt className="text-[var(--caption-muted)]">Occupancy (value)</dt>
          <dd className="text-right font-mono font-semibold text-[var(--field-green)]">
            {occPct}% · {s.headcount}/{s.ratedCapacity}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-[var(--reserve-green)]/10 pb-2">
          <dt className="text-[var(--caption-muted)]">Persons on site</dt>
          <dd className="text-right font-mono font-semibold text-[var(--earth-dark)]">{s.headcount}</dd>
        </div>
        <div>
          <dt className="text-[var(--caption-muted)]">Site content</dt>
          <dd className="mt-1 text-[13px] leading-snug text-[var(--body-text)]">{s.capacityNote}</dd>
        </div>
        <div>
          <dt className="text-[var(--caption-muted)]">Meal service (est.)</dt>
          <dd className="mt-1 font-mono text-[var(--earth-dark)]">{s.estimatedMeals} meals / cycle</dd>
        </div>
        <div>
          <dt className="text-[var(--caption-muted)]">Food availability (linked hub lanes)</dt>
          <dd className="mt-1 text-[12px] leading-relaxed text-[var(--body-text)]">
            {hub ? foodAvailabilityLine(hub) : "Linked hub offline in this demo."}
          </dd>
        </div>
      </dl>

      {hub && !hubIntakeClosed && (
        <Link
          href={`/user/warehouse/${hub.id}`}
          className="mt-4 inline-block text-xs font-semibold text-[var(--field-green)] hover:underline"
        >
          Open linked hub →
        </Link>
      )}
      {hub && hubIntakeClosed && (
        <p className="mt-4 text-xs font-medium text-[var(--alert-terracotta)]">
          Hub self-serve reservations are paused — this site still receives routed support.
        </p>
      )}
    </li>
  );
}

export default function UserShelterPage() {
  const { hoursToImpact, sortedWarehouses, warehouses, phase } = useRelief();
  const unlocked = isShelterIntelUnlocked(hoursToImpact);
  const hubIntakeClosed = isHubReservationIntakeClosed(phase, hoursToImpact);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--earth-dark)]">Shelters</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
          Each relief hub lists three official shelter spokes below. Live occupancy and meal
          figures are withheld until your area is within {SHELTER_INTEL_UNLOCK_HOURS} hours of
          predicted impact so early traffic does not overwhelm sites.
        </p>
      </div>

      {!unlocked ? (
        <>
          <div className="alert-card-amber border border-[var(--harvest-amber)]/30 p-6">
            <div className="flex flex-wrap items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-[var(--harvest-amber)]" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--earth-dark)]">Emergency information — limited release</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--body-text)]">
                  Shelter rosters, occupancy, supplies, and food lane tie-ins are shown only when
                  impact is within <strong>{SHELTER_INTEL_UNLOCK_HOURS} hours</strong> (T−
                  {SHELTER_INTEL_UNLOCK_HOURS}h or less on the county clock). Until then, use the
                  names and addresses below for orientation only — do not travel to a shelter
                  unless instructed by local emergency services.
                </p>
                <p className="mt-3 text-xs font-medium text-[var(--caption-muted)]">
                  Current demo clock:{" "}
                  <span className="font-mono text-[var(--field-green)]">T−{hoursToImpact}h</span> ·
                  Use <strong>Demo controls</strong> to move the countdown and preview an unlocked
                  board.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sortedWarehouses.map((hub) => (
              <section key={hub.id} className="glass rounded-2xl border border-[var(--line)] p-5">
                <h2 className="text-lg font-bold text-[var(--earth-dark)]">{hub.name}</h2>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-[var(--caption-muted)]">
                  <Home className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--field-green)]" />
                  {hub.address}
                </p>
                <p className="mt-2 text-xs text-[var(--body-text)]">
                  <strong>Three shelter spokes</strong> linked to this hub (detailed stats unlock
                  at T−{SHELTER_INTEL_UNLOCK_HOURS}h).
                </p>
                <ul className="mt-4 divide-y divide-[var(--reserve-green)]/10">
                  {sheltersForWarehouse(hub.id).map((s) => (
                    <li key={s.id} className="py-4 first:pt-0">
                      <p className="font-semibold text-[var(--earth-dark)]">{s.name}</p>
                      <p className="mt-1 text-xs text-[var(--caption-muted)]">{s.address}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-[var(--field-green)]/25 bg-[rgba(73,120,188,0.08)] px-4 py-3 text-sm text-[var(--earth-dark)]">
            <div className="flex flex-wrap items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--field-green)]" aria-hidden />
              <span className="font-semibold">Shelter intel active</span>
              <span className="text-[var(--caption-muted)]">
                (T−{hoursToImpact}h — within {SHELTER_INTEL_UNLOCK_HOURS}h window)
              </span>
            </div>
          </div>

          <div className="space-y-10">
            {sortedWarehouses.map((hub) => {
              const w = warehouses.find((x) => x.id === hub.id);
              return (
                <section key={hub.id}>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--earth-dark)]">{hub.name}</h2>
                      <p className="mt-1 text-sm text-[var(--body-text)]">{hub.address}</p>
                      <p className="mt-2 text-xs text-[var(--caption-muted)]">
                        Three registered shelter spokes for this hub.
                      </p>
                    </div>
                    {!hubIntakeClosed && w && (
                      <Link
                        href={`/user/warehouse/${hub.id}`}
                        className="text-xs font-semibold text-[var(--field-green)] hover:underline"
                      >
                        Open linked hub →
                      </Link>
                    )}
                    {hubIntakeClosed && (
                      <p className="max-w-md text-xs font-medium leading-relaxed text-[var(--alert-terracotta)]">
                        Hub basket registration is closed during this disaster window — follow
                        shelter guidance; stock is prioritized for spokes.
                      </p>
                    )}
                  </div>
                  <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {sheltersForWarehouse(hub.id).map((s) => (
                      <ShelterDetailCard
                        key={s.id}
                        s={s}
                        hub={w}
                        hubIntakeClosed={hubIntakeClosed}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
