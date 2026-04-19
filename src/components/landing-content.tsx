import Link from "next/link";
import { ArrowRight, Map, Package, ShieldCheck, Users, Warehouse } from "lucide-react";
import { ReliefGridShieldLogo } from "@/components/brand/reliefgrid-shield-logo";
import { WheatMotif } from "@/components/brand/wheat-motif";

const phases = [
  {
    key: "before",
    title: "Before",
    subtitle: "Map · Stock · Prepare",
    className:
      "border-[var(--field-green)]/40 bg-[rgba(73,120,188,0.12)] text-[var(--earth-dark)]",
  },
  {
    key: "during",
    title: "During",
    subtitle: "Locate · Route · Distribute",
    className:
      "border-[var(--harvest-amber)]/55 bg-[rgba(232,184,75,0.15)] text-[var(--earth-dark)]",
  },
  {
    key: "after",
    title: "After",
    subtitle: "Replenish · Learn · Adapt",
    className: "border-[#6b8faf]/45 bg-[rgba(107,143,175,0.14)] text-[var(--earth-dark)]",
  },
  {
    key: "always",
    title: "Always",
    subtitle: "Community-led · Dignified access",
    className:
      "border-[var(--reserve-green)] bg-[var(--reserve-green)] text-[#f5faf6] shadow-md shadow-black/15",
  },
] as const;

export default function LandingContent() {
  return (
    <div className="min-h-screen">
      <header className="hero-landing-bg relative overflow-hidden px-4 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="pointer-events-none absolute inset-0 hero-landing-stripes" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_minmax(200px,320px)] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e3edf9]">
              Track 2 · Food Institute
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <ReliefGridShieldLogo className="h-16 w-16 shrink-0 opacity-95 drop-shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]" />
              <h1 className="text-balance font-bold tracking-tight text-[#f5faf6] [font-size:clamp(2rem,5vw,3.25rem)] leading-[1.1]">
                ReliefGrid
              </h1>
            </div>
            <p className="mt-4 max-w-xl text-pretty text-lg font-medium leading-snug text-[#dce8f8] md:text-xl">
              Feeding communities when it matters most
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#b8cde8]">
              Local knowledge · Pre-positioned resilience · Dignified access
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm"
                style={{ backgroundColor: "#4978bc" }}
              >
                SDG 2
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm"
                style={{ backgroundColor: "#356199" }}
              >
                SDG 13
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm"
                style={{ backgroundColor: "var(--sdg-17)" }}
              >
                SDG 17
              </span>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/user/register"
                className="btn-brand-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg ring-2 ring-white/25 transition"
              >
                Register as resident
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/user/login"
                className="btn-hero-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition"
              >
                Resident sign in
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium text-[#cfe2fa]">
              <Link
                href="/hub/login"
                className="underline decoration-white/35 underline-offset-2 hover:text-white"
              >
                Hub operator
              </Link>
              <span aria-hidden>·</span>
              <Link
                href="/admin/login"
                className="underline decoration-white/35 underline-offset-2 hover:text-white"
              >
                Master admin
              </Link>
            </div>
          </div>
          <div className="mx-auto flex justify-center lg:mx-0 lg:justify-end">
            <WheatMotif />
          </div>
        </div>
      </header>

      <section className="border-b border-[var(--reserve-green)]/10 bg-[var(--grain-white)] px-4 py-10">
        <p className="mx-auto mb-4 max-w-6xl text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--caption-muted)]">
          Solution scope
        </p>
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <div
              key={p.key}
              className={`rounded-xl border-2 px-4 py-4 text-center ${p.className}`}
            >
              <div className="text-base font-bold">{p.title}</div>
              <div
                className={`mt-1 text-xs leading-snug ${p.key === "always" ? "text-[#c8d9c4]" : "text-[var(--body-text)] opacity-90"}`}
              >
                {p.subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="alert-card-amber p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a6a1f]">
              Early warning · Active
            </p>
            <h3 className="mt-2 text-base font-semibold text-[var(--earth-dark)]">
              Flood risk — Zone 3
            </h3>
            <p className="mt-2 text-[13px] leading-[1.7] text-[var(--body-text)]">
              Harvest amber signals urgency without panic: hubs rebalance lanes and residents see
              fair holds before roads narrow.
            </p>
          </div>

          <div className="card-reserve p-5">
            <div className="flex items-center gap-2 text-[var(--field-green)]">
              <Warehouse className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--field-green)]">
                Reserve · North hub
              </span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-[var(--earth-dark)]">Pre-positioned stock</h3>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-[var(--caption-muted)]">
                <span>Lane capacity</span>
                <span className="font-mono font-semibold text-[var(--field-green)]">72%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-[var(--field-green)]"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[var(--caption-muted)]">
              <Users className="h-3.5 w-3.5" aria-hidden />
              <span>340 families served (demo figures)</span>
            </p>
          </div>

          <div className="rounded-xl border-2 border-[var(--alert-terracotta)]/50 bg-[rgba(194,90,53,0.06)] p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--alert-terracotta)]">
              Active crisis only
            </p>
            <h3 className="mt-2 text-base font-semibold text-[var(--earth-dark)]">Alert terracotta</h3>
            <p className="mt-2 text-[13px] leading-[1.7] text-[var(--body-text)]">
              Reserved for impact-state UI (e.g. hazard active). The live app maps this to your
              demo phase control — warm amber first, terracotta when distribution is under stress.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Map,
              title: "Nutrition lanes, not just SKUs",
              body: "Protein, carbs, fiber, hydration — color-coded against hub capacity so urgency is human-obvious.",
            },
            {
              icon: Package,
              title: "Reserves that return to the commons",
              body: "Time-boxed holds from registration melt back if families cannot travel — dignity without ghost stock.",
            },
            {
              icon: ShieldCheck,
              title: "Verified donor pathways",
              body: "In-kind tickets flow through hub desks; credits unlock only after eyes-on verification.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl border border-[var(--reserve-green)]/10 p-6 transition hover:border-[var(--field-green)]/35"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(73,120,188,0.15)] text-[var(--field-green)] ring-1 ring-[var(--field-green)]/25">
                <f.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--earth-dark)]">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.7] text-[var(--body-text)]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
