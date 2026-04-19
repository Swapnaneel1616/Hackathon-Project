"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ClipboardList, Gift, Home, LogOut, MapPin, Tent } from "lucide-react";
import { ReliefGridShieldLogo } from "@/components/brand/reliefgrid-shield-logo";
import { useRelief } from "@/context/relief-context";

const links = [
  { href: "/user/home", label: "Hub", icon: Home },
  { href: "/user/reservations", label: "Reservations", icon: ClipboardList },
  { href: "/user/shelter", label: "Shelter", icon: Tent },
  { href: "/user/donate", label: "Donate", icon: Gift },
  { href: "/user/redeem", label: "Redeem", icon: MapPin },
];

export function UserNav() {
  const pathname = usePathname();
  const { user, logoutUser } = useRelief();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--reserve-green)]/12 bg-[rgba(245,240,232,0.92)] backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/user/home" className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--grain-white)] shadow-md ring-1 ring-[var(--field-green)]/35">
            <ReliefGridShieldLogo className="h-10 w-10 scale-95" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[var(--earth-dark)]">ReliefConnect</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--caption-muted)]">
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
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-[rgba(73,120,188,0.18)] text-[var(--reserve-green)] ring-1 ring-[var(--field-green)]/35"
                  : "text-[var(--body-text)] hover:bg-[rgba(73,120,188,0.14)] hover:text-[var(--reserve-green)]",
              )}
            >
              <Icon className="h-4 w-4 opacity-90" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium text-[var(--caption-muted)]">Signed in</div>
              <div className="max-w-[140px] truncate text-xs font-semibold text-[var(--field-green)]">
                {user.firstName} {user.lastName}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => logoutUser()}
            className="rounded-xl border border-[var(--reserve-green)]/15 bg-white/90 p-2 text-[var(--caption-muted)] shadow-sm hover:bg-[var(--grain-white)] hover:text-[var(--earth-dark)]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex border-t border-[var(--reserve-green)]/10 bg-[rgba(245,240,232,0.75)] px-2 py-2 md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold",
              pathname === href || pathname.startsWith(href + "/")
                ? "text-[var(--reserve-green)]"
                : "text-[var(--caption-muted)]",
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
