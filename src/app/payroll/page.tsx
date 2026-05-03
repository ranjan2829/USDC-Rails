"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface PayrollRow {
  name: string;
  address: string;
  amount: string;
  status: "pending" | "sending" | "done" | "failed";
  txId?: string;
  error?: string;
}

const DEMO_CSV = `name,address,amount
Alice Kumar,0x154212C94280f8277607c6f8052365c3F44782BC,1
Bob Raza,0x154212C94280f8277607c6f8052365c3F44782BC,1
Carol Santos,0x154212C94280f8277607c6f8052365c3F44782BC,1`;

function parseCSV(text: string): PayrollRow[] {
  const lines = text.trim().split("\n");
  const dataLines = lines[0].toLowerCase().includes("name") ? lines.slice(1) : lines;
  return dataLines
    .map((line) => {
      const parts = line.split(",").map(p => p.trim().replace(/"/g, ""));
      if (parts.length < 3 || !parts[1].startsWith("0x")) return null;
      return { name: parts[0], address: parts[1], amount: parts[2], status: "pending" as const };
    })
    .filter(Boolean) as PayrollRow[];
}

export default function PayrollPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setRows(parseCSV(ev.target?.result as string));
      setDone(false);
    };
    reader.readAsText(file);
  }

  async function sendAll() {
    setSending(true);
    for (let i = 0; i < rows.length; i++) {
      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "sending" } : r));
      try {
        const res = await fetch("/api/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletId: process.env.NEXT_PUBLIC_DEMO_WALLET_ID || "b5d911fd-8d0b-5ed1-88b1-2d244bff80fe",
            recipientAddress: rows[i].address,
            amount: rows[i].amount,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "done", txId: data.transactionId } : r));
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed";
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "failed", error } : r));
      }
    }
    setSending(false);
    setDone(true);
  }

  const total = rows.reduce((s, r) => s + parseFloat(r.amount || "0"), 0);
  const sentCount = rows.filter(r => r.status === "done").length;
  const failedCount = rows.filter(r => r.status === "failed").length;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-600 hover:text-gray-300 transition text-sm">←</Link>
          <span className="font-semibold">Global Payroll</span>
          <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full ml-auto">
            Track 1
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {rows.length === 0 && (
          <>
            {/* Upload area */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold mb-2">Pay your team globally</h1>
              <p className="text-gray-500 text-sm">Upload a CSV with recipients. We handle the rest.</p>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/8 hover:border-violet-500/40 rounded-2xl p-12 text-center cursor-pointer transition-all group mb-4"
            >
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:bg-violet-500/10 transition">
                📄
              </div>
              <p className="text-white font-medium mb-1">Drop CSV file here</p>
              <p className="text-gray-600 text-sm mb-4">or click to browse</p>
              <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-500">
                name, wallet_address, amount_usdc
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <button
              onClick={() => { setRows(parseCSV(DEMO_CSV)); setDone(false); }}
              className="w-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 rounded-2xl py-3.5 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Load demo data (3 recipients)
            </button>

            {/* CSV preview */}
            <div className="mt-8 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-gray-600 font-mono uppercase tracking-wide">Expected format</p>
              </div>
              <pre className="p-4 text-xs font-mono text-gray-500 leading-6 overflow-x-auto">{DEMO_CSV}</pre>
            </div>
          </>
        )}

        {rows.length > 0 && (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-semibold">{rows.length} recipients</p>
                <p className="text-gray-500 text-sm">{total.toFixed(2)} USDC total</p>
              </div>
              {done && (
                <div className="flex gap-3 text-sm">
                  <span className="text-emerald-400 font-medium">{sentCount} sent</span>
                  {failedCount > 0 && <span className="text-red-400">{failedCount} failed</span>}
                </div>
              )}
              {!sending && !done && (
                <button
                  onClick={() => setRows([])}
                  className="text-xs text-gray-600 hover:text-gray-400 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden mb-5">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0">
                {/* Header */}
                <div className="contents">
                  {["#", "Recipient", "Amount", "Status"].map((h, i) => (
                    <div key={h} className={`px-5 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide border-b border-white/5 ${i === 2 || i === 3 ? "text-right" : ""}`}>
                      {h}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {rows.map((row, i) => (
                  <div key={i} className="contents">
                    <div className="px-5 py-3.5 text-xs text-gray-700 border-b border-white/[0.03]">{i + 1}</div>
                    <div className="px-5 py-3.5 border-b border-white/[0.03]">
                      <p className="text-sm font-medium text-white">{row.name}</p>
                      <p className="text-xs font-mono text-gray-600 mt-0.5">
                        {row.address.slice(0, 8)}…{row.address.slice(-6)}
                      </p>
                    </div>
                    <div className="px-5 py-3.5 text-right text-sm font-medium border-b border-white/[0.03]">
                      {row.amount} USDC
                    </div>
                    <div className="px-5 py-3.5 text-right border-b border-white/[0.03]">
                      {row.status === "pending" && <span className="text-xs text-gray-600">Queued</span>}
                      {row.status === "sending" && (
                        <span className="text-xs text-yellow-400 animate-pulse">Sending…</span>
                      )}
                      {row.status === "done" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                          ✓ Sent
                          {row.txId && (
                            <a
                              href={`https://testnet.arcscan.app/tx/${row.txId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:text-blue-400"
                            >
                              ↗
                            </a>
                          )}
                        </span>
                      )}
                      {row.status === "failed" && (
                        <span className="text-xs text-red-400" title={row.error}>✗ Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar while sending */}
            {sending && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Processing</span>
                  <span>{sentCount + failedCount} / {rows.length}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${((sentCount + failedCount) / rows.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!done && (
              <button
                onClick={sendAll}
                disabled={sending}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold transition-all"
              >
                {sending
                  ? `Sending… ${sentCount + failedCount} of ${rows.length}`
                  : `Pay ${rows.length} recipients · ${total.toFixed(2)} USDC ⚡`}
              </button>
            )}

            {done && (
              <button
                onClick={() => { setRows([]); setDone(false); }}
                className="w-full bg-white/5 hover:bg-white/8 border border-white/5 rounded-2xl py-4 font-medium text-gray-400 hover:text-white transition"
              >
                New payroll run
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
