"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRelief } from "@/context/relief-context";

export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useRelief();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/user/login");
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
