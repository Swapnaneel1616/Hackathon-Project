"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRelief } from "@/context/relief-context";

export function RequireHub({ children }: { children: React.ReactNode }) {
  const { hubSession } = useRelief();
  const router = useRouter();

  useEffect(() => {
    if (!hubSession) router.replace("/hub/login");
  }, [hubSession, router]);

  if (!hubSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
