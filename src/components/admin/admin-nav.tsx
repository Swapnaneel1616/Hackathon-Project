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
    <header className="glass sticky top-0 z-40 border-b border-orange-500/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-600 text-sm font-black text-slate-950">
            WH
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">
              Warehouse console
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              Admin
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className={clsx(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium",
              pathname.startsWith("/admin/dashboard")
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Operations
          </Link>
          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
