"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRelief } from "@/context/relief-context";

export default function ResetLocalPage() {
  const { resetDemo } = useRelief();
  const router = useRouter();

  const wipe = () => {
    resetDemo();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-bold text-[var(--earth-dark)]">Reset local demo data</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--body-text)]">
        This removes every ReliefConnect demo record from your browser: registered residents
        (passwords), reservations, tickets, hub and admin sessions, funding ledger, and
        warehouse stock — then restores warehouses to the built-in seed values. This
        build does not use a remote database; nothing is deleted on a server.
      </p>
      <button
        type="button"
        onClick={wipe}
        className="btn-pitch-primary mt-8 w-full rounded-2xl py-3 text-sm font-bold"
      >
        Erase everything &amp; restore defaults
      </button>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-semibold text-[var(--field-green)] hover:underline"
      >
        Cancel — back to home
      </Link>
    </div>
  );
}
