"use client";

import { useState } from "react";
import { useRelief } from "@/context/relief-context";

export default function HubFundingPage() {
  const { hubSession, warehouses, hubFunds, hubLedger, fundingRequests, submitFundingRequest } =
    useRelief();
  const w = warehouses.find((x) => x.id === hubSession?.warehouseId);
  const [amount, setAmount] = useState("500");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const balance = hubSession ? (hubFunds[hubSession.warehouseId] ?? 0) : 0;
  const ledger = hubLedger.filter((l) => l.warehouseId === hubSession?.warehouseId);
  const myReqs = fundingRequests.filter((r) => r.warehouseId === hubSession?.warehouseId);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubSession || !w) return;
    setMsg(null);
    const r = submitFundingRequest(hubSession.warehouseId, Number(amount), note);
    if (!r.ok) {
      setMsg(r.reason);
      return;
    }
    setMsg("Request sent to master admin. They will approve or reject in My requests.");
    setNote("");
  };

  if (!hubSession || !w) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My fundings</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--body-text)]">
          Operating balance for paid restocks. When it runs low, send a funding request to the
          master admin layer.
        </p>
        <p className="mt-4 text-3xl font-bold text-[var(--reserve-green)]">${balance}</p>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800">Request more funds</h2>
        <form onSubmit={send} className="mt-4 grid gap-3 sm:max-w-md">
          <label className="text-sm font-medium text-[var(--earth-dark)]">
            Amount (USD)
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white/85 px-3 py-2 text-slate-800"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-[var(--earth-dark)]">
            Note to master admin
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white/85 px-3 py-2 text-sm text-slate-800"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you need funds, expected convoys, etc."
            />
          </label>
          {msg && (
            <p className="text-xs font-medium leading-relaxed text-[var(--body-text)]">{msg}</p>
          )}
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 py-2.5 text-sm font-bold text-slate-950"
          >
            Send request to master admin
          </button>
        </form>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800">Your funding requests</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {myReqs.length === 0 && <li className="text-slate-500">None yet.</li>}
          {myReqs.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200/90 bg-slate-50/95 px-3 py-2">
              <span className="font-mono text-[10px] text-slate-500">{r.id}</span> · ${r.amount} ·{" "}
              <span className="font-semibold capitalize text-[var(--field-green)]">{r.status}</span>
              {r.grantAmount != null && r.status === "approved" && (
                <span className="text-slate-400"> · granted ${r.grantAmount}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800">Ledger (this hub)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--body-text)]">
            <thead>
              <tr className="border-b border-slate-200/90 text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">When</th>
                <th className="py-2 pr-2">Kind</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-slate-500">
                    No ledger entries yet.
                  </td>
                </tr>
              )}
              {ledger.map((row) => (
                <tr key={row.id} className="border-b border-slate-200/70">
                  <td className="py-2 pr-2 font-mono text-xs">
                    {new Date(row.at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-2">{row.kind}</td>
                  <td
                    className={`py-2 pr-2 font-mono font-semibold ${row.amount >= 0 ? "text-[var(--field-green)]" : "text-[var(--alert-terracotta)]"}`}
                  >
                    {row.amount >= 0 ? "+" : ""}
                    {row.amount}
                  </td>
                  <td className="py-2 text-xs text-slate-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
