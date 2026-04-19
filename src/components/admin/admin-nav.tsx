"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export function AdminNav() {
  const pathname = usePathname();
  const { logoutAdmin } = useRelief();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--harvest-amber)]/35 bg-[rgba(232,184,75,0.12)] backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--reserve-green)] text-sm font-black text-[#f5faf6] shadow-md">
            MA
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[var(--earth-dark)]">Master admin</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--field-green)]">
              Observability
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className={clsx(
              "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
              pathname.startsWith("/admin/dashboard")
                ? "bg-[rgba(73,120,188,0.18)] text-[var(--reserve-green)] ring-1 ring-[var(--field-green)]/35"
                : "text-[var(--body-text)] hover:bg-[rgba(232,184,75,0.15)] hover:text-[var(--reserve-green)]",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="rounded-xl border border-[var(--field-green)]/30 bg-[var(--grain-white)]/95 p-2 text-[var(--body-text)] shadow-sm hover:bg-[rgba(73,120,188,0.12)]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
