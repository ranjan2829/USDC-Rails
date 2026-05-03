"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ExternalLink } from "lucide-react";
import { SUPPORTED_CORRIDORS, FEE_COMPARISON } from "@/lib/circle";

const AED_TO_USD = 1 / 3.6725;

const CORRIDOR_CURRENCY_CODE: Record<string, string> = {
  India: "INR",
  Pakistan: "PKR",
  Philippines: "PHP",
  Bangladesh: "BDT",
  USA: "USD",
  UK: "GBP",
  Europe: "EUR",
};

interface FxRates { [key: string]: number }

export default function SendPage() {
  const [step, setStep] = useState<"form" | "confirm" | "processing" | "done">("form");
  const [inputCurrency, setInputCurrency] = useState<"USD" | "AED">("USD");
  const [form, setForm] = useState({ amount: "", recipientAddress: "", destinationCountry: "India" });
  const [fxRates, setFxRates] = useState<FxRates>({});
  const [txData, setTxData] = useState<{ transactionId: string; status: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(d => { if (d.rates) setFxRates(d.rates); })
      .catch(() => {});
  }, []);

  const rawAmount = parseFloat(form.amount || "0");
  const usdcAmount = inputCurrency === "AED" ? rawAmount * AED_TO_USD : rawAmount;
  const corridor = SUPPORTED_CORRIDORS.find(c => c.to === form.destinationCountry);
  const destCode = CORRIDOR_CURRENCY_CODE[form.destinationCountry] ?? "";
  const destRate = fxRates[destCode] ?? 0;
  const recipientGets = destRate > 0 ? (usdcAmount * destRate) : null;
  const fmtRecipient = recipientGets
    ? recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })
    : null;

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/" 
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
          </Link>
          <div>
            <h1 className="font-semibold">Send USDC</h1>
            <p className="text-xs text-foreground-muted">Cross-border transfer</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        {step === "form" && (
          <div className="space-y-5">
            {/* Amount Input */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-foreground-muted font-medium">You send</span>
                <div className="flex bg-background-secondary rounded-lg p-1 gap-1">
                  {(["USD", "AED"] as const).map(cur => (
                    <button
                      key={cur}
                      onClick={() => setInputCurrency(cur)}
                      className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                        inputCurrency === cur
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-foreground-muted text-3xl font-light">
                  {inputCurrency === "AED" ? "AED" : "$"}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="flex-1 bg-transparent text-5xl font-semibold placeholder-foreground-subtle/50 focus:outline-none w-full tracking-tight"
                />
              </div>
              {inputCurrency === "AED" && rawAmount > 0 && (
                <p className="text-sm text-foreground-muted mt-4 pt-4 border-t border-border">
                  = <span className="text-foreground font-medium">${usdcAmount.toFixed(2)} USDC</span>
                  <span className="ml-2 text-foreground-subtle">at 1 AED = $0.2723</span>
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-sm text-foreground-muted font-medium block mb-4">Destination</span>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CORRIDORS.map(c => (
                  <button
                    key={c.to}
                    onClick={() => setForm({ ...form, destinationCountry: c.to })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      form.destinationCountry === c.to
                        ? "bg-accent/10 border-2 border-accent text-foreground"
                        : "bg-background-secondary border-2 border-transparent hover:border-border text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span>{c.to}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FX Estimate */}
            {fmtRecipient && usdcAmount > 0 && (
              <div className="flex items-center gap-4 bg-accent/5 border border-accent/20 rounded-2xl px-6 py-5">
                <span className="text-3xl">{corridor?.flag}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground-muted mb-1">Recipient gets approx.</p>
                  <p className="text-foreground font-semibold text-xl">
                    {corridor?.currency} {fmtRecipient}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground-subtle">1 USD</p>
                  <p className="text-sm text-foreground-muted font-medium">{destRate.toFixed(2)} {destCode}</p>
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
                onChange={e => setForm({ ...form, recipientAddress: e.target.value })}
                className="w-full bg-background-secondary rounded-xl px-4 py-3 font-mono text-sm placeholder-foreground-subtle/50 focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
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
                    <span className="text-destructive text-sm font-semibold">${wuFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-sm text-foreground-muted">Wise</span>
                    </div>
                    <span className="text-warning text-sm font-semibold">${wiseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm text-foreground font-medium">USDC Rails</span>
                    </div>
                    <span className="text-success text-sm font-bold">${platformFee.toFixed(2)}</span>
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
              className="w-full bg-primary text-primary-foreground disabled:bg-foreground-subtle/20 disabled:text-foreground-subtle disabled:cursor-not-allowed rounded-2xl py-4 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-6 border-b border-border">
                <p className="text-sm text-foreground-muted mb-2">Sending</p>
                <p className="text-4xl font-semibold tracking-tight">
                  {usdcAmount.toFixed(2)} <span className="text-foreground-muted text-2xl font-normal">USDC</span>
                </p>
                {inputCurrency === "AED" && (
                  <p className="text-sm text-foreground-muted mt-2">AED {rawAmount.toFixed(2)}</p>
                )}
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">To</span>
                  <span className="text-foreground font-medium">{corridor?.flag} {form.destinationCountry}</span>
                </div>
                {fmtRecipient && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Approx. received</span>
                    <span className="text-accent font-medium">{corridor?.currency} {fmtRecipient}</span>
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
                  <span className="text-success font-medium">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground-muted">Recipient receives</span>
                  <span className="text-foreground">{netUsdc.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("form")}
                className="bg-card hover:bg-background-secondary border border-border rounded-2xl py-4 font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 rounded-2xl py-4 font-semibold transition flex items-center justify-center gap-2"
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
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Settling on Arc</p>
              <p className="text-foreground-muted">Broadcasting USDC transaction...</p>
            </div>
          </div>
        )}

        {step === "done" && txData && (
          <div className="space-y-5">
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-success/10 flex items-center justify-center">
                <Check className="w-10 h-10 text-success" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold mb-1">Sent Successfully</p>
                <p className="text-foreground-muted">Confirmed on Arc testnet</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <p className="text-3xl font-semibold">
                  {usdcAmount.toFixed(2)} <span className="text-foreground-muted text-lg font-normal">USDC</span>
                </p>
                {inputCurrency === "AED" && <p className="text-sm text-foreground-muted mt-1">AED {rawAmount.toFixed(2)}</p>}
              </div>
              <div className="px-6 py-5 space-y-3 text-sm">
                {fmtRecipient && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Approx. received</span>
                    <span className="text-accent font-medium">{corridor?.currency} {fmtRecipient}</span>
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
                    className="font-mono text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    {txData.transactionId?.slice(0, 12)}...
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setStep("form"); setTxData(null); }}
              className="w-full bg-card hover:bg-background-secondary border border-border rounded-2xl py-4 font-medium transition"
            >
              New transfer
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
