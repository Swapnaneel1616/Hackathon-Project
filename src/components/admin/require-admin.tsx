"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRelief } from "@/context/relief-context";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { adminSession } = useRelief();
  const router = useRouter();

  useEffect(() => {
    if (!adminSession) router.replace("/admin/login");
  }, [adminSession, router]);

  if (!adminSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
