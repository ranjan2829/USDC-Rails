"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock, Plus, Loader2, ExternalLink, X } from "lucide-react";

interface Escrow {
  id: string; title: string; description: string | null;
  amount: number; recipient: string; status: string;
  tx_id: string | null; created_at: string; released_at: string | null;
}

const STATUS = {
  locked:   { label: "Locked",   className: "text-warning  bg-warning/10"   },
  released: { label: "Released", className: "text-success  bg-success/10"   },
  cancelled:{ label: "Cancelled",className: "text-destructive bg-destructive/10" },
};

export default function EscrowPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", amount: "", recipient: "" });
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/escrow").then(r => r.json());
    setEscrows(r.escrows ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const r = await fetch("/api/escrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(r => r.json());
    if (r.error) { setError(r.error); setSubmitting(false); return; }
    setEscrows(prev => [r.escrow, ...prev]);
    setForm({ title: "", description: "", amount: "", recipient: "" });
    setShowForm(false);
    setSubmitting(false);
  }

  async function handleRelease(id: string) {
    setReleasing(id);
    const r = await fetch("/api/escrow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(r => r.json());
    if (!r.error) {
      setEscrows(prev => prev.map(e => e.id === id ? { ...e, status: "released", tx_id: r.txId } : e));
    }
    setReleasing(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-sm">Trade Finance Escrow</h1>
            <p className="text-xs text-foreground-muted">Lock USDC, release on milestone</p>
          </div>
          <span className="text-xs font-medium text-foreground-muted border border-border px-3 py-1.5 rounded-full">Track 2</span>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-85 transition-opacity"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? "Cancel" : "New Escrow"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5 relative z-10">

        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="font-medium text-sm mb-5">Create Escrow</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Title</label>
                  <input
                    type="text" required placeholder="Website redesign milestone"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Amount (USDC)</label>
                  <input
                    type="number" required min="0.01" step="0.01" placeholder="500"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Recipient Wallet</label>
                <input
                  type="text" required placeholder="0x..."
                  value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Milestone Description</label>
                <textarea
                  rows={2} placeholder="Funds released upon delivery of final designs..."
                  value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <button
                type="submit" disabled={submitting}
                className="w-full bg-foreground text-background rounded-xl py-3 font-semibold text-sm hover:opacity-85 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {submitting ? "Locking…" : "Lock funds in escrow"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-5 h-5 border-2 border-foreground-subtle border-t-foreground rounded-full animate-spin" />
          </div>
        ) : escrows.length === 0 && !showForm ? (
          <div className="bg-card border border-border rounded-2xl py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-foreground/6 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-foreground-muted" />
            </div>
            <p className="text-foreground-muted text-sm mb-1">No escrows yet</p>
            <p className="text-foreground-subtle text-xs">Lock USDC in escrow until milestones are met</p>
          </div>
        ) : (
          <div className="space-y-3">
            {escrows.map(e => {
              const s = STATUS[e.status as keyof typeof STATUS] ?? STATUS.locked;
              return (
                <div key={e.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{e.title}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.className}`}>{s.label}</span>
                      </div>
                      {e.description && <p className="text-xs text-foreground-muted mb-2">{e.description}</p>}
                      <p className="text-xs font-mono text-foreground-subtle">
                        {e.recipient.slice(0, 12)}…{e.recipient.slice(-6)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold">${e.amount.toFixed(2)}</p>
                      <p className="text-xs text-foreground-muted">USDC</p>
                    </div>
                  </div>

                  {e.status === "locked" && (
                    <button
                      onClick={() => handleRelease(e.id)}
                      disabled={releasing === e.id}
                      className="mt-4 flex items-center gap-2 text-sm border border-border hover:border-foreground/20 rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      {releasing === e.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Unlock className="w-3.5 h-3.5" />}
                      Release to recipient
                    </button>
                  )}

                  {e.tx_id && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${e.tx_id}`}
                      target="_blank" rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> View on Arc Explorer
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
