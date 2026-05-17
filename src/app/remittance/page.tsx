"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Loader2, ExternalLink,
  RefreshCw, Zap, Shield, Clock, Send as SendIcon, ChevronDown,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────
const CORRIDORS = [
  { to: "India",       code: "INR", flag: "🇮🇳", symbol: "₹"  },
  { to: "Pakistan",    code: "PKR", flag: "🇵🇰", symbol: "Rs" },
  { to: "Philippines", code: "PHP", flag: "🇵🇭", symbol: "₱"  },
  { to: "Bangladesh",  code: "BDT", flag: "🇧🇩", symbol: "৳"  },
  { to: "USA",         code: "USD", flag: "🇺🇸", symbol: "$"  },
  { to: "UK",          code: "GBP", flag: "🇬🇧", symbol: "£"  },
  { to: "Europe",      code: "EUR", flag: "🇪🇺", symbol: "€"  },
];

const PURPOSES = [
  "Family support",
  "Medical expenses",
  "Education fees",
  "Business payment",
  "Property payment",
  "Gift",
  "Other",
];

const FEE_PCT = 0.001;
const AED_PER_USD = 3.6725; // UAE Central Bank peg

// ── Types ─────────────────────────────────────────────────────────────────
type Step = "amount" | "recipient" | "review" | "processing" | "done";

interface Corridor {
  to: string;
  code: string;
  flag: string;
  symbol: string;
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function RemittancePage() {
  const [step, setStep] = useState<Step>("amount");
  const [currency, setCurrency] = useState<"AED" | "USD">("AED");
  const [amount, setAmount] = useState("");
  const [dest, setDest] = useState<Corridor>(CORRIDORS[0]);

  const [fxRates, setFxRates]   = useState<Record<string, number>>({});
  const [ratesTs, setRatesTs]   = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientAddr, setRecipientAddr] = useState("");
  const [purpose, setPurpose] = useState(PURPOSES[0]);

  const [txData, setTxData] = useState<{ transactionId: string; status: string } | null>(null);
  const [error, setError]   = useState("");

  // ── Derived ──────────────────────────────────────────────────────────
  const raw   = parseFloat(amount || "0");
  const usdc  = currency === "AED" ? raw / AED_PER_USD : raw;
  const fee   = usdc * FEE_PCT;
  const net   = usdc - fee;
  const destRate     = fxRates[dest.code] ?? 0;
  const recipientGets = destRate > 0 ? net * destRate : null;

  const STEP_KEYS: Step[] = ["amount", "recipient", "review"];
  const stepIdx = STEP_KEYS.indexOf(step);

  useEffect(() => { loadRates(); }, []);

  function loadRates() {
    setRefreshing(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(d => { if (d.rates) { setFxRates(d.rates); setRatesTs(Date.now()); } })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }

  async function handleSend() {
    setStep("processing");
    setError("");
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientAddress: recipientAddr,
          amount: net.toFixed(6),
          destinationCountry: dest.to,
          inputCurrency: currency,
          inputAmount: raw,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTxData(data);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed");
      setStep("review");
    }
  }

  function reset() {
    setStep("amount");
    setAmount("");
    setRecipientName("");
    setRecipientAddr("");
    setTxData(null);
    setError("");
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="grid-bg opacity-20 absolute inset-0" />
        <div className="absolute -top-32 left-1/4 w-[560px] h-[560px] rounded-full bg-amber-500/6 blur-[130px]" />
        <div className="absolute bottom-0 right-1/3 w-[420px] h-[420px] rounded-full bg-primary/6 blur-[110px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm">Remittance</h1>
            <p className="text-xs text-foreground-muted truncate">
              🇦🇪 UAE → {dest.flag} {dest.to} · USDC on Arc
            </p>
          </div>

          {/* Step dots */}
          {STEP_KEYS.includes(step) && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {STEP_KEYS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < stepIdx
                      ? "bg-primary w-4 opacity-50"
                      : i === stepIdx
                      ? "bg-primary w-7"
                      : "bg-border w-3"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 relative z-10">

        {/* ─────────────────────── STEP 1: AMOUNT ───────────────────── */}
        {step === "amount" && (
          <div className="space-y-4 animate-slide-up">

            {/* Live FX ticker */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{dest.flag}</span>
                <div>
                  <p className="text-[11px] text-foreground-subtle uppercase tracking-wider">Live rate</p>
                  <p className="font-semibold text-sm">
                    {destRate > 0
                      ? `1 USD = ${dest.symbol} ${destRate.toFixed(2)} ${dest.code}`
                      : refreshing ? "Fetching…" : "Unavailable"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ratesTs && (
                  <span className="text-[11px] text-foreground-subtle">
                    {Math.floor((Date.now() - ratesTs) / 60000)}m ago
                  </span>
                )}
                <button
                  onClick={loadRates}
                  disabled={refreshing}
                  className="p-2 rounded-xl text-foreground-muted hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  You send
                </span>
                <div className="flex bg-background-secondary rounded-xl p-0.5 gap-0.5">
                  {(["AED", "USD"] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`text-xs px-3.5 py-2 rounded-[10px] font-semibold transition-all ${
                        currency === c
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      {c === "AED" ? "د.إ AED" : "$ USD"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-foreground-subtle">
                  {currency === "AED" ? "د.إ" : "$"}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-5xl font-bold placeholder-border/60 focus:outline-none tracking-tight min-w-0"
                  autoFocus
                />
              </div>

              {currency === "AED" && raw > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-foreground-subtle">USDC equivalent</span>
                  <span className="text-sm font-bold text-primary">
                    ${usdc.toFixed(4)} USDC
                  </span>
                </div>
              )}
            </div>

            {/* Destination grid */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <span className="text-[11px] text-foreground-subtle uppercase tracking-wider font-medium block mb-4">
                Send to
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CORRIDORS.map(c => (
                  <button
                    key={c.to}
                    onClick={() => setDest(c)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      dest.to === c.to
                        ? "bg-primary/10 border-2 border-primary text-foreground"
                        : "bg-background-secondary border-2 border-transparent hover:border-border text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <p className="leading-tight">{c.to}</p>
                      <p className="text-xs opacity-60">{c.symbol} {c.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient gets preview */}
            {recipientGets && usdc > 0 && (
              <div className="relative overflow-hidden bg-card border border-primary/25 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground-muted mb-1.5">Recipient receives approx.</p>
                    <p className="text-3xl font-bold tracking-tight text-primary">
                      {dest.symbol}{" "}
                      {recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-foreground-subtle mt-1.5">{dest.code} via USDC</p>
                  </div>
                  <span className="text-6xl opacity-25 select-none">{dest.flag}</span>
                </div>

                {/* Animated corridor line */}
                <div className="mt-4 h-px bg-border rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-primary to-transparent animate-flow-line" />
                </div>

                <div className="flex justify-between mt-3 text-xs text-foreground-subtle">
                  <span>Fee: ${fee.toFixed(4)} USDC (0.1%)</span>
                  <span className="text-success flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Near-instant
                  </span>
                </div>
              </div>
            )}

            {/* Fee comparison */}
            {usdc > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-[11px] text-foreground-subtle uppercase tracking-wider mb-4">
                  Fee comparison
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Western Union", pct: 0.045, color: "text-destructive", bar: "bg-destructive/70" },
                    { label: "Wise",          pct: 0.021, color: "text-warning",     bar: "bg-warning/70"    },
                    { label: "USDC Rails",    pct: 0.001, color: "text-primary",     bar: "bg-primary"       },
                  ].map(p => {
                    const feeAmt = usdc * p.pct;
                    const barW   = (p.pct / 0.045) * 100;
                    return (
                      <div key={p.label} className="flex items-center gap-3">
                        <span className="text-xs text-foreground-muted w-28 flex-shrink-0">{p.label}</span>
                        <div className="flex-1 h-1.5 bg-background-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${p.bar} rounded-full transition-all duration-700`}
                            style={{ width: `${barW}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${p.color} w-12 text-right flex-shrink-0`}>
                          ${feeAmt.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep("recipient")}
              disabled={!amount || usdc <= 0}
              className="w-full bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-primary"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ───────────────────── STEP 2: RECIPIENT ──────────────────── */}
        {step === "recipient" && (
          <div className="space-y-4 animate-slide-up">

            {/* Amount summary */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{dest.flag}</span>
                <div>
                  <p className="text-xs text-foreground-muted">{dest.to}</p>
                  {recipientGets && (
                    <p className="text-sm font-semibold text-primary">
                      ≈ {dest.symbol}{recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })} {dest.code}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">${usdc.toFixed(4)} USDC</p>
                {currency === "AED" && (
                  <p className="text-xs text-foreground-muted">د.إ {raw.toFixed(2)} AED</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <p className="text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                Recipient details
              </p>

              <div>
                <label className="text-xs text-foreground-muted block mb-2">Full name</label>
                <input
                  type="text"
                  placeholder="Recipient's name"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full bg-background-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-foreground-muted block mb-2">Wallet address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddr}
                  onChange={e => setRecipientAddr(e.target.value)}
                  className="w-full bg-background-secondary rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-foreground-muted block mb-2">Purpose of transfer</label>
                <div className="relative">
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full bg-background-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all appearance-none cursor-pointer"
                  >
                    {PURPOSES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("amount")}
                className="bg-card border border-border rounded-2xl py-4 font-medium text-sm hover:bg-card-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("review")}
                disabled={!recipientName || !recipientAddr}
                className="bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────── STEP 3: REVIEW ───────────────────── */}
        {step === "review" && (
          <div className="space-y-4 animate-slide-up">

            {/* Corridor visualization */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4">
                {/* Sender */}
                <div className="flex-1 text-center">
                  <div className="text-4xl mb-2">🇦🇪</div>
                  <p className="text-xs text-foreground-muted">UAE</p>
                  <p className="font-bold text-sm mt-1">
                    {currency === "AED"
                      ? `د.إ ${raw.toFixed(2)}`
                      : `$${raw.toFixed(2)}`}
                  </p>
                </div>

                {/* Flow */}
                <div className="flex-[1.4] flex flex-col items-center gap-2 px-2">
                  <div className="text-[11px] bg-background-secondary border border-border px-3 py-1 rounded-full text-foreground-muted whitespace-nowrap">
                    ${usdc.toFixed(4)} USDC
                  </div>
                  <div className="w-full h-px bg-border rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-primary to-transparent animate-flow-line" />
                  </div>
                  <div className="text-[11px] text-foreground-subtle">0.1% fee</div>
                </div>

                {/* Recipient */}
                <div className="flex-1 text-center">
                  <div className="text-4xl mb-2">{dest.flag}</div>
                  <p className="text-xs text-foreground-muted">{dest.to}</p>
                  <p className="font-bold text-sm mt-1 text-primary">
                    {recipientGets
                      ? `${dest.symbol}${recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })}`
                      : `$${net.toFixed(4)} USDC`}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-[11px] text-foreground-subtle uppercase tracking-wider">Transfer details</p>
              </div>
              <div className="px-6 py-5 space-y-3">
                <Row label="Recipient"  value={recipientName} />
                <Row label="Wallet"     value={`${recipientAddr.slice(0, 10)}…${recipientAddr.slice(-6)}`} mono />
                <Row label="Purpose"    value={purpose} />
                <Row label="You send"   value={`$${usdc.toFixed(4)} USDC`} />
                <Row label="Fee (0.1%)" value={`$${fee.toFixed(4)} USDC`} />
                <div className="pt-3 border-t border-border">
                  <Row label="Net transfer" value={`$${net.toFixed(4)} USDC`} bold />
                </div>
                {recipientGets && (
                  <Row
                    label={`≈ ${dest.code} received`}
                    value={`${dest.symbol}${recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })}`}
                    highlight
                  />
                )}
              </div>

              {/* Speed row */}
              <div className="px-6 py-4 border-t border-border grid grid-cols-3 gap-4">
                {[
                  { icon: <Zap   className="w-3.5 h-3.5" />, label: "Settlement", value: "~30 sec"  },
                  { icon: <Shield className="w-3.5 h-3.5" />, label: "Network",    value: "Arc L1"   },
                  { icon: <Clock className="w-3.5 h-3.5" />,  label: "vs Banks",   value: "3–5 days" },
                ].map(b => (
                  <div key={b.label} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-foreground-subtle mb-1">
                      {b.icon}
                      <span className="text-[10px]">{b.label}</span>
                    </div>
                    <p className="text-xs font-semibold">{b.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("recipient")}
                className="bg-card border border-border rounded-2xl py-4 font-medium text-sm hover:bg-card-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                className="bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-primary"
              >
                <SendIcon className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────── PROCESSING ───────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-3xl border border-primary/30 animate-pulse-ring" />
              <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="w-9 h-9 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold mb-2">Broadcasting…</p>
              <p className="text-sm text-foreground-muted">Settling USDC on Arc testnet</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground-subtle">
              <span>🇦🇪 UAE</span>
              <div className="h-px w-8 bg-primary/40" />
              <span>{dest.flag} {dest.to}</span>
            </div>
          </div>
        )}

        {/* ─────────────────────────── DONE ─────────────────────────── */}
        {step === "done" && txData && (
          <div className="space-y-4 animate-slide-up">

            {/* Success hero */}
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-success/12 border border-success/25 flex items-center justify-center">
                  <Check className="w-10 h-10 text-success" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold mb-1">Transfer Complete</p>
                <p className="text-sm text-foreground-muted">On-chain in seconds, not days</p>
              </div>
            </div>

            {/* Receipt */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground-muted mb-1">To {recipientName} · {dest.to}</p>
                  <p className="text-3xl font-bold text-primary tracking-tight">
                    {recipientGets
                      ? `${dest.symbol}${recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })}`
                      : `$${net.toFixed(4)} USDC`}
                  </p>
                </div>
                <span className="text-5xl opacity-40 select-none">{dest.flag}</span>
              </div>
              <div className="px-6 py-5 space-y-3 text-sm">
                <Row label="Sent"    value={`$${usdc.toFixed(4)} USDC`} />
                <Row label="Fee"     value={`$${fee.toFixed(4)} USDC`}  />
                <Row label="Purpose" value={purpose} />
                <Row label="Network" value="Arc Testnet" />
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-foreground-muted">Transaction</span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${txData.transactionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {txData.transactionId.slice(0, 14)}…
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full bg-card border border-border rounded-2xl py-4 font-medium hover:bg-card-hover transition-colors"
            >
              New Transfer
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Shared row component ──────────────────────────────────────────────────
function Row({
  label, value, mono, bold, highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-foreground-muted text-sm">{label}</span>
      <span
        className={[
          "text-sm",
          mono      ? "font-mono text-xs" : "",
          bold      ? "font-semibold"      : "",
          highlight ? "text-primary font-semibold" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
