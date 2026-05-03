"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Plus, Loader2, ExternalLink, X, Check } from "lucide-react";

interface Invoice {
  id: string; client_name: string; description: string | null;
  amount: number; due_date: string | null; status: string;
  tx_id: string | null; created_at: string; paid_at: string | null;
}

const STATUS = {
  unpaid:  { label: "Unpaid",  className: "text-warning    bg-warning/10"    },
  paid:    { label: "Paid",    className: "text-success    bg-success/10"    },
  overdue: { label: "Overdue", className: "text-destructive bg-destructive/10" },
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ client_name: "", description: "", amount: "", due_date: "" });
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/invoice").then(r => r.json());
    setInvoices(r.invoices ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const r = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(r => r.json());
    if (r.error) { setError(r.error); setSubmitting(false); return; }
    setInvoices(prev => [r.invoice, ...prev]);
    setForm({ client_name: "", description: "", amount: "", due_date: "" });
    setShowForm(false);
    setSubmitting(false);
  }

  async function handlePay(id: string) {
    setPaying(id);
    const r = await fetch("/api/invoice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(r => r.json());
    if (!r.error) {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "paid", tx_id: r.txId } : inv));
    }
    setPaying(null);
  }

  const totalUnpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-sm">USDC Invoices</h1>
            <p className="text-xs text-foreground-muted">Create invoices, get paid in USDC</p>
          </div>
          <span className="text-xs font-medium text-foreground-muted border border-border px-3 py-1.5 rounded-full">Track 3</span>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-85 transition-opacity"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? "Cancel" : "New Invoice"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5 relative z-10">

        {/* Summary */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total invoices",    value: invoices.length.toString() },
              { label: "Outstanding",        value: `$${totalUnpaid.toFixed(2)}` },
              { label: "Paid",              value: invoices.filter(i => i.status === "paid").length.toString() },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-foreground-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="font-medium text-sm mb-5">New Invoice</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Client Name</label>
                  <input
                    type="text" required placeholder="Acme Corp"
                    value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Amount (USDC)</label>
                  <input
                    type="number" required min="0.01" step="0.01" placeholder="1500"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Description</label>
                  <input
                    type="text" placeholder="Consulting services - March"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <button
                type="submit" disabled={submitting}
                className="w-full bg-foreground text-background rounded-xl py-3 font-semibold text-sm hover:opacity-85 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {submitting ? "Creating…" : "Create invoice"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-5 h-5 border-2 border-foreground-subtle border-t-foreground rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 && !showForm ? (
          <div className="bg-card border border-border rounded-2xl py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-foreground/6 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-foreground-muted" />
            </div>
            <p className="text-foreground-muted text-sm mb-1">No invoices yet</p>
            <p className="text-foreground-subtle text-xs">Create invoices and get paid in USDC instantly</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <p className="font-medium text-sm">Invoices</p>
            </div>
            <div className="divide-y divide-border">
              {invoices.map(inv => {
                const s = STATUS[inv.status as keyof typeof STATUS] ?? STATUS.unpaid;
                const isOverdue = inv.status === "unpaid" && inv.due_date && new Date(inv.due_date) < new Date();
                const effectiveStatus = isOverdue ? STATUS.overdue : s;
                return (
                  <div key={inv.id} className="px-6 py-4 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium">{inv.client_name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${effectiveStatus.className}`}>
                          {isOverdue ? "Overdue" : effectiveStatus.label}
                        </span>
                      </div>
                      {inv.description && <p className="text-xs text-foreground-muted">{inv.description}</p>}
                      {inv.due_date && (
                        <p className="text-xs text-foreground-subtle mt-0.5">
                          Due {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">${inv.amount.toFixed(2)} USDC</p>
                      {inv.tx_id ? (
                        <a
                          href={`https://testnet.arcscan.app/tx/${inv.tx_id}`}
                          target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors mt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Receipt
                        </a>
                      ) : inv.status === "unpaid" ? (
                        <button
                          onClick={() => handlePay(inv.id)}
                          disabled={paying === inv.id}
                          className="mt-1 flex items-center gap-1.5 text-xs border border-border hover:border-foreground/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 ml-auto"
                        >
                          {paying === inv.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Check className="w-3 h-3" />}
                          Mark paid
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
