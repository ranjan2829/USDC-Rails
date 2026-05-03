"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Users, Shield, Zap, ExternalLink, TrendingUp, ChevronRight } from "lucide-react";

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

const CORRIDORS = [
  { from: "AED", to: "INR", flag: "🇮🇳", name: "India" },
  { from: "AED", to: "PKR", flag: "🇵🇰", name: "Pakistan" },
  { from: "AED", to: "PHP", flag: "🇵🇭", name: "Philippines" },
  { from: "AED", to: "GBP", flag: "🇬🇧", name: "UK" },
  { from: "AED", to: "EUR", flag: "🇪🇺", name: "Europe" },
];

export default function Home() {
  const [fxRates, setFxRates] = useState<Record<string, number>>({});
  const [activeRate, setActiveRate] = useState(0);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates) setFxRates(d.rates);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRate((prev) => (prev + 1) % CORRIDORS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentCorridor = CORRIDORS[activeRate];
  const rate = fxRates[currentCorridor.to] || 0;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-serif font-bold text-lg">R</span>
            </div>
            <span className="font-medium tracking-tight">USDC Rails</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#rates" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Rates
            </Link>
            <a
              href="https://developers.circle.com/w3s/docs/arc-overview"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1"
            >
              Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Arc Testnet</span>
            </div>
            <Link
              href="/login"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/send"
              className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all flex items-center gap-2"
            >
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 text-xs border border-border px-4 py-2 rounded-full mb-8 animate-slide-up">
            <span className="text-foreground-muted">Circle Arc Hackathon 2025</span>
            <span className="w-1 h-1 bg-foreground-muted rounded-full" />
            <span className="text-foreground font-medium">$25,000</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.1] mb-8 animate-slide-up stagger-1">
            Move money{" "}
            <span className="font-serif italic">anywhere</span>
            <br />
            settle <span className="font-serif italic">instantly</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up stagger-2">
            Cross-border payments from UAE to the world. Pay in{" "}
            <span className="text-foreground font-medium">{CURRENCY_SYMBOLS.AED} AED</span>, settle in{" "}
            <span className="text-primary font-medium">{CURRENCY_SYMBOLS.USD} USDC</span>. Real-time rates, 0.1% fees.
          </p>

          {/* Live FX Ticker */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-slide-up stagger-3">
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-2.5">
              <TrendingUp className="w-4 h-4 text-foreground-muted" />
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentCorridor.flag}</span>
                <div className="text-left">
                  <p className="text-xs text-foreground-muted">
                    1 {CURRENCY_SYMBOLS.USD} USD
                  </p>
                  <p className="text-foreground text-sm font-medium">
                    {CURRENCY_SYMBOLS[currentCorridor.to]} {rate.toFixed(2)} {currentCorridor.to}
                  </p>
                </div>
              </div>
              <span className="text-xs text-foreground-muted border border-border px-2 py-0.5 rounded">LIVE</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-4">
            <Link
              href="/send"
              className="w-full sm:w-auto bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all flex items-center justify-center gap-2"
            >
              Start Sending
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto border border-border hover:border-foreground-muted text-foreground px-8 py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              Create Account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Currency Symbols Row */}
          <div className="flex items-center justify-center gap-6 mt-16 animate-slide-up stagger-5">
            {CORRIDORS.map((c, i) => (
              <div
                key={c.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 ${
                  i === activeRate ? "bg-card border border-primary/30 scale-110" : "opacity-50"
                }`}
              >
                <span className="text-2xl">{c.flag}</span>
                <span className="text-sm font-medium text-foreground-muted">
                  {CURRENCY_SYMBOLS[c.to]} {c.to}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "~3s", label: "Settlement", icon: "⚡" },
              { value: "0.1%", label: "Platform Fee", icon: "💎" },
              { value: "7+", label: "Corridors", icon: "🌍" },
              { value: "$25K", label: "Prize Pool", icon: "🏆" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="group relative text-center bg-card border border-border rounded-2xl py-6 px-4 hover:border-primary/50 transition-all duration-300"
              >
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="text-3xl md:text-4xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-sm text-foreground-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-foreground-muted uppercase tracking-[0.2em] mb-4">Products</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
              <span className="font-serif italic">Everything</span> you need
            </h2>
            <p className="text-foreground-muted">Purpose-built rails for modern payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send USDC */}
            <Link href="/send" className="group">
              <div className="h-full bg-card border border-border rounded-2xl p-8 hover:border-foreground/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/15 transition-colors">
                    <Globe className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground-muted">
                    Track 1
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Cross-Border <span className="font-serif italic">Payments</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Send {CURRENCY_SYMBOLS.AED} AED to {CURRENCY_SYMBOLS.INR} INR, {CURRENCY_SYMBOLS.PKR} PKR,{" "}
                  {CURRENCY_SYMBOLS.PHP} PHP and more. Live FX, transparent fees.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium group-hover:text-foreground group-hover:gap-3 transition-all">
                  Open app
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Global Payroll */}
            <Link href="/payroll" className="group">
              <div className="h-full bg-card border border-border rounded-2xl p-8 hover:border-foreground/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/15 transition-colors">
                    <Users className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground-muted">
                    Track 1
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Global <span className="font-serif italic">Payroll</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Upload CSV, pay your team worldwide. On-chain receipts, zero bank delays.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium group-hover:text-foreground group-hover:gap-3 transition-all">
                  Open app
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Trade Finance */}
            <div className="group opacity-50 cursor-not-allowed">
              <div className="h-full bg-card border border-border rounded-2xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-foreground-subtle" />
                  </div>
                  <span className="text-xs font-medium text-foreground-subtle">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Trade Finance <span className="font-serif italic">Escrow</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Lock {CURRENCY_SYMBOLS.USD} USDC in smart escrow. Release on milestone completion.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium">Track 2</div>
              </div>
            </div>

            {/* AI Agent */}
            <div className="group opacity-50 cursor-not-allowed">
              <div className="h-full bg-card border border-border rounded-2xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-foreground-subtle" />
                  </div>
                  <span className="text-xs font-medium text-foreground-subtle">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">
                  AI Payment <span className="font-serif italic">Agent</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Autonomous agent that orchestrates cross-border payments with nanopayments.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium">Track 4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Rates Section */}
      <section id="rates" className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-[0.2em] mb-2">Live Rates</p>
                <h3 className="text-2xl font-light">
                  Real-time <span className="font-serif italic">FX rates</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-pulse" />
                Auto-updating
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CORRIDORS.map((c) => {
                const r = fxRates[c.to] || 0;
                return (
                  <div
                    key={c.to}
                    className="bg-background-secondary border border-border-subtle rounded-2xl p-4 text-center hover:border-primary/30 transition-all"
                  >
                    <span className="text-3xl block mb-2">{c.flag}</span>
                    <p className="text-xs text-foreground-muted mb-1">{c.name}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {CURRENCY_SYMBOLS[c.to]} {r.toFixed(2)}
                    </p>
                    <p className="text-xs text-foreground-subtle">per $1 USD</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border rounded-2xl p-8 md:p-10 text-center">
            <p className="text-xs text-foreground-muted uppercase tracking-[0.2em] mb-6">Powered By</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3772FF] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-medium">Circle</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2775CA] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{CURRENCY_SYMBOLS.USD}</span>
                </div>
                <span className="font-medium">USDC</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background font-bold text-sm">A</span>
                </div>
                <span className="font-medium">Arc L1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
                <span className="text-background font-serif font-bold text-sm">R</span>
              </div>
              <span>Built for Circle Arc Hackathon 2025</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Arc Testnet Chain ID 5042002</span>
              <a
                href="https://testnet.arcscan.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Explorer
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
