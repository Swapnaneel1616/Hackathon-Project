"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export default function AdminLoginPage() {
  const { adminSession, loginAdmin } = useRelief();
  const router = useRouter();
  const [email, setEmail] = useState("admin@warehouse.com");
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (adminSession) router.replace("/admin/dashboard");
  }, [adminSession, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = loginAdmin(email, password);
    if (!r.ok) {
      setErr(r.reason);
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-md rounded-3xl border border-orange-500/20 p-8">
        <Link href="/" className="text-xs font-semibold text-orange-200/80 hover:text-orange-100">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Warehouse admin</h1>
        <p className="mt-2 text-sm text-slate-400">
          Demo credentials pre-filled — inventory &amp; donation tickets.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Email
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
              <Mail className="h-4 w-4 text-orange-400" />
              <input
                type="email"
                className="w-full bg-transparent text-sm text-white outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Password
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
              <Lock className="h-4 w-4 text-orange-300" />
              <input
                type="password"
                className="w-full bg-transparent text-sm text-white outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>
          {err && <p className="text-xs text-rose-300">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-rose-600 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Enter console
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Resident?{" "}
          <Link href="/user/login" className="text-cyan-300 hover:underline">
            User sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
