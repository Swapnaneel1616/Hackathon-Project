import Link from "next/link";
import { ArrowRight, Layers, Map, ShieldCheck, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 md:py-24">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            George Hacks · GW Food Institute track
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            Food access that stays{" "}
            <span className="text-gradient">ahead of the storm</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-400 md:text-lg">
            ReliefGrid coordinates government relief hubs before impact: map
            urgency by nutritional lane, reserve balanced allotments, route
            donor tickets, and flip to shelter spokes when the hazard window
            closes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/user/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:brightness-110"
            >
              Register as resident
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/user/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Resident sign in
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-7 py-3.5 text-sm font-semibold text-orange-100 hover:bg-orange-500/20"
            >
              Warehouse admin
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Map,
              title: "Nutrition lanes, not just SKUs",
              body: "Lane labels (protein, carbs, fiber, …) are color-coded vs hub capacity so urgency is obvious at a glance.",
            },
            {
              icon: Layers,
              title: "Reservations that behave",
              body: "Time-boxed holds from registration return to inventory if the window slips — no ghost stock during crunch time.",
            },
            {
              icon: ShieldCheck,
              title: "Donor tickets → verified credits",
              body: "Residents create tickets; warehouse admins close them to release points for in-person redemptions.",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-3xl p-6">
              <f.icon className="h-8 w-8 text-cyan-300" />
              <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
