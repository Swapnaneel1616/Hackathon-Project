"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Lock, Mail } from "lucide-react";
import { useRelief } from "@/context/relief-context";
import { HUB_OPERATOR_ACCOUNTS, HUB_OPERATOR_PASSWORD } from "@/lib/hub-accounts";

export default function HubLoginPage() {
  const { hubSession, loginHub } = useRelief();
  const router = useRouter();
  const [email, setEmail] = useState("hub1@example.com");
  const [password, setPassword] = useState(HUB_OPERATOR_PASSWORD);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (hubSession) router.replace("/hub/dashboard");
  }, [hubSession, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = loginHub(email, password);
    if (!r.ok) {
      setErr(r.reason);
      return;
    }
    router.push("/hub/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-md rounded-3xl border border-teal-500/25 p-8">
        <Link href="/" className="text-xs font-semibold text-teal-200/90 hover:text-teal-100">
          ← Home
        </Link>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Boxes className="h-7 w-7 text-teal-400" />
          Hub operator sign in
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Each hub has its own console. Password for all demo hubs:{" "}
          <span className="font-mono text-teal-200">{HUB_OPERATOR_PASSWORD}</span>
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-slate-500">
          {HUB_OPERATOR_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <span className="font-mono text-slate-300">{a.email}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Email
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/95 px-3 py-2.5">
              <Mail className="h-4 w-4 text-teal-400" />
              <input
                type="email"
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Password
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/95 px-3 py-2.5">
              <Lock className="h-4 w-4 text-teal-300" />
              <input
                type="password"
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>
          {err && <p className="text-xs text-rose-300">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-700 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Enter my hub
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Master observability?{" "}
          <Link href="/admin/login" className="text-orange-200 hover:underline">
            Master admin
          </Link>
        </p>
      </div>
    </div>
  );
}
