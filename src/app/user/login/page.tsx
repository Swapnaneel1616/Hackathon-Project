"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export default function UserLoginPage() {
  const { user, loginUser } = useRelief();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/user/home");
  }, [user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = loginUser(email, password);
    if (!r.ok) {
      setErr(r.reason);
      return;
    }
    router.push("/user/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80 hover:text-cyan-200"
        >
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Resident sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Access hubs, donations, and redemptions.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Email
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
              <Mail className="h-4 w-4 text-cyan-400" />
              <input
                type="email"
                autoComplete="email"
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
              <Lock className="h-4 w-4 text-violet-300" />
              <input
                type="password"
                autoComplete="current-password"
                className="w-full bg-transparent text-sm text-white outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>
          {err && (
            <p className="text-xs text-rose-300">{err}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          No account?{" "}
          <Link href="/user/register" className="text-cyan-300 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-600">
          Warehouse staff:{" "}
          <Link href="/admin/login" className="text-orange-300/90 hover:underline">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
