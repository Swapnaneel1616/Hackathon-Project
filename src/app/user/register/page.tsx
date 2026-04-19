"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useRelief } from "@/context/relief-context";

export default function UserRegisterPage() {
  const { user, registerUser } = useRelief();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [householdSize, setHouseholdSize] = useState(3);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/user/home");
  }, [user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = registerUser({
      email,
      password,
      profile: {
        firstName,
        lastName,
        addressLine,
        city,
        state: province,
        postalCode,
        phone,
        householdSize: Math.min(12, Math.max(1, householdSize)),
      },
    });
    if (!r.ok) {
      setErr(r.reason);
      return;
    }
    router.push("/user/home");
  };

  const field =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-lg rounded-3xl p-8">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80 hover:text-cyan-200"
        >
          ← Home
        </Link>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-white">
          <UserPlus className="h-7 w-7 text-cyan-400" />
          Create resident account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Full address helps hubs plan coverage. Demo passwords are stored locally
          only.
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300 sm:col-span-1">
            First name
            <input className={field} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300 sm:col-span-1">
            Last name
            <input className={field} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300 sm:col-span-2">
            Street address
            <input className={field} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300">
            City
            <input className={field} value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300">
            State / province
            <input className={field} value={province} onChange={(e) => setProvince(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300">
            Postal code
            <input className={field} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300">
            Phone
            <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300">
            Household (people)
            <input
              className={field}
              type="number"
              min={1}
              max={12}
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              required
            />
          </label>
          <label className="block text-sm text-slate-300 sm:col-span-2">
            Email
            <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm text-slate-300 sm:col-span-2">
            Password
            <input
              className={field}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {err && <p className="sm:col-span-2 text-xs text-rose-300">{err}</p>}
          <button
            type="submit"
            className="sm:col-span-2 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
          >
            Register &amp; continue
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/user/login" className="text-cyan-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
