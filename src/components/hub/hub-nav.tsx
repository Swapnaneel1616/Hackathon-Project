"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Boxes,
  Eye,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Ticket,
  Wallet,
} from "lucide-react";
import { useRelief } from "@/context/relief-context";

const links = [
  { href: "/hub/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hub/donations", label: "Donations", icon: Ticket },
  { href: "/hub/availability", label: "My availability", icon: Eye },
  { href: "/hub/restock", label: "Add stock", icon: PackagePlus },
  { href: "/hub/funding", label: "My fundings", icon: Wallet },
] as const;

export function HubNav() {
  const pathname = usePathname();
  const { hubSession, warehouses, logoutHub } = useRelief();
  const w = warehouses.find((x) => x.id === hubSession?.warehouseId);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--field-green)]/25 bg-[rgba(245,240,232,0.92)] backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/hub/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--reserve-green)] text-[#f5faf6] shadow-md">
            <Boxes className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[var(--earth-dark)]">Hub console</div>
            <div className="max-w-[200px] truncate text-[10px] font-semibold uppercase tracking-widest text-[var(--field-green)]">
              {w?.name ?? hubSession?.warehouseId}
            </div>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "bg-[rgba(73,120,188,0.2)] text-[var(--reserve-green)] ring-1 ring-[var(--field-green)]/35"
                  : "text-[var(--body-text)] hover:bg-[rgba(73,120,188,0.14)] hover:text-[var(--reserve-green)]",
              )}
            >
              <Icon className="h-4 w-4 opacity-85" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => logoutHub()}
            className="ml-1 rounded-xl border border-slate-200/90 bg-white/90 p-2 text-slate-500 shadow-sm hover:bg-slate-50"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
