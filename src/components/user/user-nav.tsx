"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Gift, Home, LogOut, MapPin } from "lucide-react";
import { useRelief } from "@/context/relief-context";

const links = [
  { href: "/user/home", label: "Hub", icon: Home },
  { href: "/user/donate", label: "Donate", icon: Gift },
  { href: "/user/redeem", label: "Redeem", icon: MapPin },
];

export function UserNav() {
  const pathname = usePathname();
  const { user, logoutUser } = useRelief();

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/user/home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            RG
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">
              ReliefGrid
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              Resident
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )}
            >
              <Icon className="h-4 w-4 opacity-80" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium text-slate-400">Signed in</div>
              <div className="max-w-[140px] truncate text-xs text-cyan-200">
                {user.firstName} {user.lastName}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => logoutUser()}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex border-t border-white/5 px-2 py-2 md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold",
              pathname === href || pathname.startsWith(href + "/")
                ? "text-cyan-300"
                : "text-slate-500",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
