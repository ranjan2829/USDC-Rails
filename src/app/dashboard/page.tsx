"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Globe, LogOut, Send, Users, Copy, CheckCheck,
  ExternalLink, ArrowUpRight, Wallet, Clock, Lock, FileText, Bot, Home,
} from "lucide-react";

interface UserProfile {
  id: string; email: string; name: string;
  walletAddress: string; balance: string;
}
interface Transaction {
  id: string; amount: number; recipient_address: string;
  destination_country: string | null; input_currency: string;
  input_amount: number | null; status: string;
  circle_id: string | null; created_at: string;
}

const STATUS: Record<string, { label: string; className: string }> = {
  COMPLETE:  { label: "Complete",  className: "text-success" },
  CONFIRMED: { label: "Confirmed", className: "text-success" },
  INITIATED: { label: "Pending",   className: "text-warning"  },
  FAILED:    { label: "Failed",    className: "text-destructive" },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background font-semibold text-xs select-none">
      {letters.toUpperCase()}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then(r => r.json()),
      fetch("/api/transactions").then(r => r.json()),
    ]).then(([me, txData]) => {
      if (me.error) { router.push("/login"); return; }
      setUser(me);
      setTxns(txData.transactions ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function copyAddress() {
    if (!user?.walletAddress) return;
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalSent = txns
    .filter(t => ["COMPLETE", "CONFIRMED"].includes(t.status))
    .reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground-subtle border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">USDC Rails</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Arc Testnet
            </div>
            {user && <Initials name={user.name} />}
            <Link
              href="/"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground-subtle hover:text-foreground hover:border-foreground/30 transition-all"
              title="Home"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground-subtle hover:text-foreground hover:border-foreground/30 transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6 relative z-10">

        {/* Balance card */}
        <div className="bg-card border border-border rounded-2xl p-7">
          <p className="text-xs text-foreground-muted uppercase tracking-[0.15em] mb-4">USDC Balance</p>
          <p className="text-5xl font-light tracking-tight mb-1">
            ${parseFloat(user?.balance ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-foreground-muted text-sm mb-6">USDC · Circle Wallet</p>
          <button
            onClick={copyAddress}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors group"
          >
            <span className="font-mono text-xs">
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 14)}…${user.walletAddress.slice(-6)}`
                : "No wallet"}
            </span>
            {copied
              ? <CheckCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
              : <Copy className="w-3.5 h-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <ArrowUpRight className="w-4 h-4" />, label: "Total Sent",     value: `$${totalSent.toFixed(2)}` },
            { icon: <Wallet className="w-4 h-4" />,      label: "Transactions",   value: txns.length.toString() },
            { icon: <Clock className="w-4 h-4" />,       label: "Last Payment",
              value: txns.length > 0
                ? new Date(txns[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="w-8 h-8 rounded-lg bg-foreground/8 flex items-center justify-center text-foreground-muted mb-4">
                {s.icon}
              </div>
              <p className="text-xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-foreground-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">Products</p>
          <div className="grid grid-cols-2 gap-4">
            {([
              { href: "/send",    icon: <Send className="w-5 h-5" />,     label: "Send USDC",  sub: "Cross-border payments", track: "Track 1" },
              { href: "/payroll", icon: <Users className="w-5 h-5" />,    label: "Payroll",    sub: "Batch CSV payments",    track: "Track 1" },
              { href: "/escrow",  icon: <Lock className="w-5 h-5" />,     label: "Escrow",     sub: "Trade finance lock",    track: "Track 2" },
              { href: "/invoice", icon: <FileText className="w-5 h-5" />, label: "Invoices",   sub: "Get paid in USDC",      track: "Track 3" },
              { href: "/agent",   icon: <Bot className="w-5 h-5" />,      label: "AI Agent",   sub: "Natural language pay",  track: "Track 4" },
            ] as { href: string; icon: React.ReactNode; label: string; sub: string; track: string }[]).map(({ href, icon, label, sub, track }) => (
              <Link key={href} href={href}>
                <div className="group bg-card border border-border hover:border-foreground/20 rounded-2xl p-6 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-foreground/8 flex items-center justify-center group-hover:bg-foreground/12 transition-colors">
                      {icon}
                    </div>
                    <span className="text-xs text-foreground-subtle">{track}</span>
                  </div>
                  <p className="font-medium mb-1">{label}</p>
                  <p className="text-sm text-foreground-muted">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <p className="font-medium text-sm">Transaction history</p>
            <span className="text-xs text-foreground-subtle">{txns.length} total</span>
          </div>

          {txns.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-foreground-muted text-sm mb-4">No transactions yet</p>
              <Link href="/send">
                <span className="text-sm text-foreground hover:underline inline-flex items-center gap-1">
                  Send your first payment <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {txns.map(tx => {
                const s = STATUS[tx.status] ?? { label: tx.status, className: "text-foreground-muted" };
                return (
                  <div key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-foreground/6 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-foreground-muted" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.destination_country ? `→ ${tx.destination_country}` : "Transfer"}
                      </p>
                      <p className="text-xs text-foreground-muted font-mono mt-0.5 truncate">
                        {tx.recipient_address.slice(0, 10)}…{tx.recipient_address.slice(-6)}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">−${tx.amount.toFixed(2)} USDC</p>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <span className={`text-xs font-medium ${s.className}`}>{s.label}</span>
                        {tx.circle_id && (
                          <a
                            href={`https://testnet.arcscan.app/tx/${tx.circle_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground-subtle hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-foreground-subtle flex-shrink-0 w-12 text-right">
                      {timeAgo(tx.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
