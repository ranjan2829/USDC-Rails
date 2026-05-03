"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, Check, X, ExternalLink, Loader2, DollarSign } from "lucide-react";

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
      const parts = line.split(",").map((p) => p.trim().replace(/"/g, ""));
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
    reader.onload = (ev) => {
      setRows(parseCSV(ev.target?.result as string));
      setDone(false);
    };
    reader.readAsText(file);
  }

  async function sendAll() {
    setSending(true);
    for (let i = 0; i < rows.length; i++) {
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "sending" } : r)));
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
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "done", txId: data.transactionId } : r)));
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed";
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "failed", error } : r)));
      }
    }
    setSending(false);
    setDone(true);
  }

  const total = rows.reduce((s, r) => s + parseFloat(r.amount || "0"), 0);
  const sentCount = rows.filter((r) => r.status === "done").length;
  const failedCount = rows.filter((r) => r.status === "failed").length;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-card hover:border-accent/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Global Payroll</h1>
            <p className="text-xs text-foreground-muted">Batch USDC payments</p>
          </div>
          <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
            Track 1
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 relative z-10">
        {rows.length === 0 && (
          <div className="animate-slide-up">
            {/* Upload Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Pay your team <span className="font-serif italic text-foreground-muted">globally</span>
              </h2>
              <p className="text-foreground-muted text-lg">Upload a CSV with recipients. We handle the rest.</p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-3xl p-16 text-center cursor-pointer transition-all group mb-5"
            >
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform glow-accent">
                <Upload className="w-10 h-10 text-accent" />
              </div>
              <p className="text-foreground font-semibold text-xl mb-2">Drop CSV file here</p>
              <p className="text-foreground-muted text-sm mb-5">or click to browse</p>
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3 text-xs font-mono text-foreground-muted">
                <FileSpreadsheet className="w-4 h-4" />
                name, wallet_address, amount_usdc
              </div>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-foreground-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => {
                setRows(parseCSV(DEMO_CSV));
                setDone(false);
              }}
              className="w-full bg-card hover:bg-card-hover border border-border rounded-2xl py-4 text-sm font-medium text-foreground-muted hover:text-foreground transition"
            >
              Load demo data (3 recipients)
            </button>

            {/* CSV Preview */}
            <div className="mt-10 bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs text-foreground-muted font-medium uppercase tracking-wide">Expected Format</p>
              </div>
              <pre className="p-5 text-xs font-mono text-foreground-muted leading-6 overflow-x-auto">{DEMO_CSV}</pre>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="animate-slide-up">
            {/* Summary Bar */}
            <div className="flex items-center justify-between mb-6 bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{rows.length} recipients</p>
                  <p className="text-foreground-muted">
                    <span className="text-primary font-semibold">${total.toFixed(2)}</span> USDC total
                  </p>
                </div>
              </div>
              {done && (
                <div className="flex gap-4 text-sm">
                  <span className="text-success font-semibold flex items-center gap-1.5 bg-success/10 px-3 py-1.5 rounded-full">
                    <Check className="w-4 h-4" />
                    {sentCount} sent
                  </span>
                  {failedCount > 0 && (
                    <span className="text-destructive font-semibold flex items-center gap-1.5 bg-destructive/10 px-3 py-1.5 rounded-full">
                      <X className="w-4 h-4" />
                      {failedCount} failed
                    </span>
                  )}
                </div>
              )}
              {!sending && !done && (
                <button onClick={() => setRows([])} className="text-sm text-foreground-muted hover:text-foreground transition">
                  Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-left text-xs font-medium text-foreground-muted uppercase tracking-wide w-12">
                      #
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-foreground-muted uppercase tracking-wide">
                      Recipient
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-medium text-foreground-muted uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-medium text-foreground-muted uppercase tracking-wide w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0 hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4 text-sm text-foreground-muted">{i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <p className="text-xs font-mono text-foreground-muted mt-0.5">
                          {row.address.slice(0, 8)}...{row.address.slice(-6)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-gradient">${row.amount}</span>
                        <span className="text-foreground-muted text-xs ml-1">USDC</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {row.status === "pending" && (
                          <span className="text-xs text-foreground-muted bg-background-secondary px-2 py-1 rounded-full">
                            Queued
                          </span>
                        )}
                        {row.status === "sending" && (
                          <span className="text-xs text-warning flex items-center gap-1.5 justify-end">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Sending
                          </span>
                        )}
                        {row.status === "done" && (
                          <span className="text-xs text-success flex items-center gap-1 justify-end">
                            <Check className="w-3.5 h-3.5" />
                            Sent
                            {row.txId && (
                              <a
                                href={`https://testnet.arcscan.app/tx/${row.txId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline ml-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </span>
                        )}
                        {row.status === "failed" && (
                          <span className="text-xs text-destructive flex items-center gap-1 justify-end" title={row.error}>
                            <X className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress Bar */}
            {sending && (
              <div className="mb-6 bg-card border border-border rounded-2xl p-5">
                <div className="flex justify-between text-sm text-foreground-muted mb-3">
                  <span>Processing payments...</span>
                  <span className="font-semibold text-foreground">
                    {sentCount + failedCount} / {rows.length}
                  </span>
                </div>
                <div className="h-3 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${((sentCount + failedCount) / rows.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!done && (
              <button
                onClick={sendAll}
                disabled={sending}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground disabled:from-foreground-subtle/20 disabled:to-foreground-subtle/20 disabled:text-foreground-subtle disabled:cursor-not-allowed rounded-2xl py-4 font-semibold transition-all flex items-center justify-center gap-2 shadow-lg glow-primary"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending {sentCount + failedCount} of {rows.length}
                  </>
                ) : (
                  <>
                    Pay {rows.length} recipients - ${total.toFixed(2)} USDC
                  </>
                )}
              </button>
            )}

            {done && (
              <button
                onClick={() => {
                  setRows([]);
                  setDone(false);
                }}
                className="w-full bg-card hover:bg-card-hover border border-border rounded-2xl py-4 font-medium text-foreground-muted hover:text-foreground transition"
              >
                New payroll run
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
