"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { useRelief } from "@/context/relief-context";

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

function OrderRegisteredBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("reliefHub_pendingOrderSuccess") === "1") {
        setVisible(true);
      }
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.removeItem("reliefHub_pendingOrderSuccess");
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-[var(--field-green)]/40 bg-[rgba(73,120,188,0.12)] px-4 py-3 text-sm text-[var(--earth-dark)]">
      <div className="flex gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--field-green)]" />
        <div>
          <p className="font-semibold">Your order has been registered successfully.</p>
          <p className="mt-1 text-xs text-[var(--body-text)]">
            Your hold is listed below. This confirmation only appears right after you
            confirm a basket — it will not show again when you open this page later.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserReservationsPage() {
  const { user, reservations } = useRelief();
  const email = user?.email.toLowerCase() ?? "";

  const list = user
    ? reservations
        .filter((r) => (r.residentEmail ?? "").toLowerCase() === email)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div className="space-y-6">
      <OrderRegisteredBanner />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Package className="h-7 w-7 text-cyan-400" />
          My reservations
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Only your account&apos;s holds are listed here. Active holds show pickup windows;
          fulfilled and expired rows stay for your records.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-slate-500">
          No reservations yet.{" "}
          <Link href="/user/home" className="text-teal-600 hover:underline">
            Pick a hub
          </Link>{" "}
          and confirm a basket.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const active = r.status === "active";
            return (
              <li key={r.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500">{r.id}</div>
                    <div className="font-semibold text-slate-800">{r.warehouseName}</div>
                    <p className="mt-1 text-sm text-slate-600">
                      {r.lines.map((l) => `${l.name}×${l.qty}`).join(", ")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                      active
                        ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80"
                        : r.status === "fulfilled"
                          ? "bg-slate-200/90 text-slate-700"
                          : "bg-rose-100 text-rose-900 ring-1 ring-rose-200/80"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Created {fmt(r.createdAt)}
                  </span>
                  {active && (
                    <span className="text-amber-800/90">Hold until {fmt(r.expiresAt)}</span>
                  )}
                </div>
                <Link
                  href={`/user/warehouse/${r.warehouseId}`}
                  className="mt-3 inline-block text-xs font-semibold text-teal-600 hover:underline"
                >
                  View hub →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
