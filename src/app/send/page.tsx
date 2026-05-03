"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-600 hover:text-gray-300 transition text-sm">←</Link>
          <span className="font-semibold">Send USDC</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8">
        {step === "form" && (
          <div className="space-y-4">
            {/* Amount input */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">You send</span>
                <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                  {(["USD", "AED"] as const).map(cur => (
                    <button
                      key={cur}
                      onClick={() => setInputCurrency(cur)}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                        inputCurrency === cur
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-600 text-2xl font-light">
                  {inputCurrency === "AED" ? "د.إ" : "$"}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="flex-1 bg-transparent text-4xl font-semibold placeholder-gray-700 focus:outline-none w-full"
                />
                <span className="text-gray-600 text-sm">{inputCurrency}</span>
              </div>
              {inputCurrency === "AED" && rawAmount > 0 && (
                <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-white/5">
                  = <span className="text-gray-400">${usdcAmount.toFixed(2)} USDC</span>
                  <span className="ml-2 text-gray-700">· 1 AED = $0.2723</span>
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-4">Destination</span>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CORRIDORS.map(c => (
                  <button
                    key={c.to}
                    onClick={() => setForm({ ...form, destinationCountry: c.to })}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.destinationCountry === c.to
                        ? "bg-blue-600/20 border border-blue-500/50 text-blue-300"
                        : "bg-white/5 border border-transparent hover:border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span>{c.to}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FX estimate */}
            {fmtRecipient && usdcAmount > 0 && (
              <div className="flex items-center gap-3 bg-blue-500/8 border border-blue-500/15 rounded-2xl px-5 py-4">
                <span className="text-2xl">{corridor?.flag}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Recipient gets approx.</p>
                  <p className="text-white font-semibold">
                    {corridor?.currency} {fmtRecipient}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">1 USD</p>
                  <p className="text-xs text-gray-500">≈ {destRate.toFixed(1)} {destCode}</p>
                </div>
              </div>
            )}

            {/* Recipient address */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-3">Recipient wallet</span>
              <input
                type="text"
                placeholder="0x..."
                value={form.recipientAddress}
                onChange={e => setForm({ ...form, recipientAddress: e.target.value })}
                className="w-full bg-transparent font-mono text-sm placeholder-gray-700 focus:outline-none text-gray-300"
              />
            </div>

            {/* Fee comparison */}
            {usdcAmount > 0 && (
              <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-4">Fee comparison</span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-400">Western Union</span>
                    </div>
                    <span className="text-red-400 text-sm font-medium">${wuFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-400">Wise</span>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">${wiseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-white font-medium">SwiftSettle</span>
                    </div>
                    <span className="text-emerald-400 text-sm font-semibold">${platformFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setStep("confirm")}
              disabled={!form.amount || !form.recipientAddress || usdcAmount <= 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold text-base transition-all duration-150"
            >
              Continue →
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sending</p>
                <p className="text-3xl font-bold">{usdcAmount.toFixed(2)} <span className="text-gray-500 text-xl font-normal">USDC</span></p>
                {inputCurrency === "AED" && (
                  <p className="text-sm text-gray-600 mt-1">د.إ {rawAmount.toFixed(2)} AED</p>
                )}
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">To</span>
                  <span className="text-white">{corridor?.flag} {form.destinationCountry}</span>
                </div>
                {fmtRecipient && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Approx. received</span>
                    <span className="text-blue-400">{corridor?.currency} {fmtRecipient}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Wallet</span>
                  <span className="font-mono text-xs text-gray-400">
                    {form.recipientAddress.slice(0, 8)}…{form.recipientAddress.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-500">Fee (0.1%)</span>
                  <span className="text-emerald-400">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-400">Recipient receives</span>
                  <span className="text-white">{netUsdc.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("form")}
                className="bg-white/5 hover:bg-white/8 border border-white/5 rounded-2xl py-4 font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 rounded-2xl py-4 font-semibold transition"
              >
                {loading ? "Sending…" : "Confirm ⚡"}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center text-3xl animate-pulse">
              ⚡
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">Settling on Arc…</p>
              <p className="text-gray-500 text-sm mt-1">Broadcasting USDC transaction</p>
            </div>
          </div>
        )}

        {step === "done" && txData && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-3xl">
                ✓
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">Sent</p>
                <p className="text-gray-500 text-sm mt-1">Confirmed on Arc testnet</p>
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-2xl font-bold">{usdcAmount.toFixed(2)} <span className="text-gray-500 text-base font-normal">USDC</span></p>
                {inputCurrency === "AED" && <p className="text-sm text-gray-600 mt-0.5">د.إ {rawAmount.toFixed(2)} AED</p>}
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {fmtRecipient && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Approx. received</span>
                    <span className="text-blue-400">≈ {corridor?.currency} {fmtRecipient}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-yellow-400 capitalize">{txData.status?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transaction</span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${txData.transactionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    {txData.transactionId?.slice(0, 12)}… ↗
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setStep("form"); setTxData(null); }}
              className="w-full bg-white/5 hover:bg-white/8 border border-white/5 rounded-2xl py-4 font-medium transition"
            >
              New transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
