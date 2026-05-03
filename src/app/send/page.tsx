"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ExternalLink, TrendingUp, RefreshCw } from "lucide-react";
import { SUPPORTED_CORRIDORS, FEE_COMPARISON } from "@/lib/circle";

const AED_TO_USD = 1 / 3.6725;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  AED: "د.إ",
  INR: "₹",
  PKR: "Rs",
  PHP: "₱",
  BDT: "৳",
  GBP: "£",
  EUR: "€",
};

const CORRIDOR_CURRENCY_CODE: Record<string, string> = {
  India: "INR",
  Pakistan: "PKR",
  Philippines: "PHP",
  Bangladesh: "BDT",
  USA: "USD",
  UK: "GBP",
  Europe: "EUR",
};

interface FxRates {
  [key: string]: number;
}

export default function SendPage() {
  const [step, setStep] = useState<"form" | "confirm" | "processing" | "done">("form");
  const [inputCurrency, setInputCurrency] = useState<"USD" | "AED">("AED");
  const [form, setForm] = useState({ amount: "", recipientAddress: "", destinationCountry: "India" });
  const [fxRates, setFxRates] = useState<FxRates>({});
  const [txData, setTxData] = useState<{ transactionId: string; status: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  function fetchRates() {
    setRatesLoading(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates) setFxRates(d.rates);
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }

  const rawAmount = parseFloat(form.amount || "0");
  const usdcAmount = inputCurrency === "AED" ? rawAmount * AED_TO_USD : rawAmount;
  const corridor = SUPPORTED_CORRIDORS.find((c) => c.to === form.destinationCountry);
  const destCode = CORRIDOR_CURRENCY_CODE[form.destinationCountry] ?? "";
  const destRate = fxRates[destCode] ?? 0;
  const recipientGets = destRate > 0 ? usdcAmount * destRate : null;
  const fmtRecipient = recipientGets ? recipientGets.toLocaleString("en", { maximumFractionDigits: 0 }) : null;

  const platformFee = usdcAmount * (FEE_COMPARISON.platform / 100);
  const wiseFee = usdcAmount * (FEE_COMPARISON.wise / 100);
  const wuFee = usdcAmount * (FEE_COMPARISON.westernUnion / 100);
  const netUsdc = usdcAmount - platformFee;

  async function handleSend() {
    setLoading(true);
    setError("");
    try {
      setStep("processing");
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: process.env.NEXT_PUBLIC_DEMO_WALLET_ID || "b5d911fd-8d0b-5ed1-88b1-2d244bff80fe",
          recipientAddress: form.recipientAddress,
          amount: usdcAmount.toFixed(6),
          destinationCountry: form.destinationCountry,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTxData(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  const currencySymbol = inputCurrency === "AED" ? CURRENCY_SYMBOLS.AED : CURRENCY_SYMBOLS.USD;
  const destSymbol = CURRENCY_SYMBOLS[destCode] || "";

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Send USDC</h1>
            <p className="text-xs text-foreground-muted">Cross-border transfer</p>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            Track 1
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 relative z-10">
        {step === "form" && (
          <div className="space-y-5 animate-slide-up">
            {/* Live FX Banner */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Live Rate</p>
                  <p className="text-foreground font-semibold">
                    1 {CURRENCY_SYMBOLS.USD} = {destSymbol} {destRate.toFixed(2)} {destCode}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchRates}
                disabled={ratesLoading}
                className="text-foreground-muted hover:text-primary transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${ratesLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Amount Input */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-foreground-muted font-medium">You send</span>
                <div className="flex bg-background-secondary rounded-xl p-1 gap-1">
                  {(["AED", "USD"] as const).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setInputCurrency(cur)}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                        inputCurrency === cur
                          ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg"
                          : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      {CURRENCY_SYMBOLS[cur]} {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-foreground-muted text-3xl font-light">{currencySymbol}</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="flex-1 bg-transparent text-5xl font-bold placeholder-foreground-subtle/30 focus:outline-none w-full tracking-tight"
                />
              </div>
              {inputCurrency === "AED" && rawAmount > 0 && (
                <p className="text-sm text-foreground-muted mt-4 pt-4 border-t border-border">
                  ={" "}
                  <span className="text-primary font-semibold">
                    {CURRENCY_SYMBOLS.USD}
                    {usdcAmount.toFixed(2)} USDC
                  </span>
                  <span className="ml-2 text-foreground-subtle">@ 1 {CURRENCY_SYMBOLS.AED} = $0.2723</span>
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-sm text-foreground-muted font-medium block mb-4">Destination</span>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CORRIDORS.map((c) => {
                  const code = CORRIDOR_CURRENCY_CODE[c.to];
                  const symbol = CURRENCY_SYMBOLS[code] || "";
                  return (
                    <button
                      key={c.to}
                      onClick={() => setForm({ ...form, destinationCountry: c.to })}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        form.destinationCountry === c.to
                          ? "bg-primary/10 border-2 border-primary text-foreground"
                          : "bg-background-secondary border-2 border-transparent hover:border-border text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <div className="text-left">
                        <p>{c.to}</p>
                        <p className="text-xs opacity-70">
                          {symbol} {c.currency}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FX Estimate */}
            {fmtRecipient && usdcAmount > 0 && (
              <div className="flex items-center gap-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-6 py-5">
                <span className="text-4xl">{corridor?.flag}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground-muted mb-1">Recipient gets approx.</p>
                  <p className="text-foreground font-bold text-2xl">
                    {destSymbol} {fmtRecipient}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground-subtle">1 USD</p>
                  <p className="text-sm text-foreground-muted font-medium">
                    {destSymbol} {destRate.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Recipient Address */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-sm text-foreground-muted font-medium block mb-3">Recipient wallet</span>
              <input
                type="text"
                placeholder="0x..."
                value={form.recipientAddress}
                onChange={(e) => setForm({ ...form, recipientAddress: e.target.value })}
                className="w-full bg-background-secondary rounded-xl px-4 py-3 font-mono text-sm placeholder-foreground-subtle/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-all"
              />
            </div>

            {/* Fee Comparison */}
            {usdcAmount > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <span className="text-sm text-foreground-muted font-medium block mb-5">Fee comparison</span>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="text-sm text-foreground-muted">Western Union</span>
                    </div>
                    <span className="text-destructive text-sm font-semibold">
                      {CURRENCY_SYMBOLS.USD}
                      {wuFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-sm text-foreground-muted">Wise</span>
                    </div>
                    <span className="text-warning text-sm font-semibold">
                      {CURRENCY_SYMBOLS.USD}
                      {wiseFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground font-medium">USDC Rails</span>
                    </div>
                    <span className="text-primary text-sm font-bold">
                      {CURRENCY_SYMBOLS.USD}
                      {platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setStep("confirm")}
              disabled={!form.amount || !form.recipientAddress || usdcAmount <= 0}
              className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground disabled:from-foreground-subtle/20 disabled:to-foreground-subtle/20 disabled:text-foreground-subtle disabled:cursor-not-allowed rounded-2xl py-4 font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg glow-primary"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-5 animate-slide-up">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <p className="text-sm text-foreground-muted mb-2">Sending</p>
                <p className="text-4xl font-bold tracking-tight">
                  <span className="text-gradient">{CURRENCY_SYMBOLS.USD}{usdcAmount.toFixed(2)}</span>
                  <span className="text-foreground-muted text-2xl font-normal ml-2">USDC</span>
                </p>
                {inputCurrency === "AED" && (
                  <p className="text-sm text-foreground-muted mt-2">
                    {CURRENCY_SYMBOLS.AED} {rawAmount.toFixed(2)} AED
                  </p>
                )}
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">To</span>
                  <span className="text-foreground font-medium">
                    {corridor?.flag} {form.destinationCountry}
                  </span>
                </div>
                {fmtRecipient && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Approx. received</span>
                    <span className="text-primary font-medium">
                      {destSymbol} {fmtRecipient}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Wallet</span>
                  <span className="font-mono text-xs text-foreground-muted">
                    {form.recipientAddress.slice(0, 8)}...{form.recipientAddress.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-border">
                  <span className="text-foreground-muted">Fee (0.1%)</span>
                  <span className="text-primary font-medium">
                    {CURRENCY_SYMBOLS.USD}
                    {platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground-muted">Recipient receives</span>
                  <span className="text-foreground">
                    {CURRENCY_SYMBOLS.USD}
                    {netUsdc.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("form")}
                className="bg-card hover:bg-card-hover border border-border rounded-2xl py-4 font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:opacity-90 disabled:opacity-50 rounded-2xl py-4 font-semibold transition flex items-center justify-center gap-2 shadow-lg glow-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center glow-primary">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Settling on Arc</p>
              <p className="text-foreground-muted">Broadcasting USDC transaction...</p>
            </div>
          </div>
        )}

        {step === "done" && txData && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                <Check className="w-12 h-12 text-success" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold mb-1">Sent Successfully</p>
                <p className="text-foreground-muted">Confirmed on Arc testnet</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <p className="text-3xl font-bold">
                  <span className="text-gradient">
                    {CURRENCY_SYMBOLS.USD}
                    {usdcAmount.toFixed(2)}
                  </span>
                  <span className="text-foreground-muted text-lg font-normal ml-2">USDC</span>
                </p>
                {inputCurrency === "AED" && (
                  <p className="text-sm text-foreground-muted mt-1">
                    {CURRENCY_SYMBOLS.AED} {rawAmount.toFixed(2)} AED
                  </p>
                )}
              </div>
              <div className="px-6 py-5 space-y-3 text-sm">
                {fmtRecipient && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Approx. received</span>
                    <span className="text-primary font-medium">
                      {destSymbol} {fmtRecipient}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Status</span>
                  <span className="text-warning capitalize font-medium">{txData.status?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">Transaction</span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${txData.transactionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {txData.transactionId?.slice(0, 12)}...
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStep("form");
                setTxData(null);
              }}
              className="w-full bg-card hover:bg-card-hover border border-border rounded-2xl py-4 font-medium transition"
            >
              New transfer
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
