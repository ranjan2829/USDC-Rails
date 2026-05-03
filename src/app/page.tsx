"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Users, Zap, ExternalLink, TrendingUp, Lock, FileText, Bot } from "lucide-react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", AED: "د.إ", INR: "₹", PKR: "Rs", PHP: "₱", BDT: "৳", GBP: "£", EUR: "€",
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
      .then(r => r.json())
      .then(d => { if (d.rates) setFxRates(d.rates); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveRate(p => (p + 1) % CORRIDORS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const corridor = CORRIDORS[activeRate];
  const rate = fxRates[corridor.to] || 0;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">USDC Rails</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-foreground-muted">
            <a href="#products" className="hover:text-foreground transition-colors">Products</a>
            <a href="#rates" className="hover:text-foreground transition-colors">Live Rates</a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Arc Testnet
            </div>
            <Link
              href="/login"
              className="text-sm text-foreground-muted hover:text-foreground px-4 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-85 transition-opacity flex items-center gap-1.5"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs text-foreground-muted border border-border bg-card px-4 py-2 rounded-full mb-10 animate-slide-up">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Built on Circle Arc L1 · USDC · ~3s finality
          </div>

          {/* Headline — mixed weight, proper serif */}
          <h1 className="mb-8 animate-slide-up stagger-1">
            <span className="block text-6xl md:text-8xl font-light tracking-[-0.03em] leading-[0.95] text-foreground">
              Move money
            </span>
            <span className="block text-6xl md:text-8xl font-serif italic text-foreground-muted leading-[1.05] tracking-[-0.01em]">
              anywhere.
            </span>
          </h1>

          <div className="flex items-center justify-center gap-6 mb-8 animate-slide-up stagger-2">
            {["No banks", "No borders", "0.1% fee"].map((tag, i) => (
              <span key={tag} className="flex items-center gap-6">
                <span className="text-sm text-foreground-muted font-medium">{tag}</span>
                {i < 2 && <span className="text-border text-lg leading-none">·</span>}
              </span>
            ))}
          </div>

          {/* Live FX ticker */}
          <div className="flex justify-center mb-8 animate-slide-up stagger-3">

            <div className="flex items-center gap-2.5 border border-border rounded-xl px-4 py-2.5 bg-card text-sm">
              <TrendingUp className="w-4 h-4 text-foreground-muted" />
              <span className="text-foreground-muted">1 USD =</span>
              <span className="text-2xl">{corridor.flag}</span>
              <span className="font-semibold">
                {CURRENCY_SYMBOLS[corridor.to]}{rate.toFixed(2)}
              </span>
              <span className="text-[10px] text-foreground-subtle border border-border px-1.5 py-0.5 rounded-md">LIVE</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up stagger-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-foreground text-background px-8 py-3.5 rounded-full font-semibold hover:opacity-85 transition-opacity flex items-center justify-center gap-2 shadow-lg"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-border hover:border-foreground-muted text-foreground px-8 py-3.5 rounded-full font-medium transition-colors flex items-center justify-center gap-2"
            >
              Sign in
            </Link>
          </div>

          {/* Corridor strip */}
          <div className="flex items-center justify-center gap-3 mt-14 flex-wrap animate-slide-up stagger-4">
            {CORRIDORS.map((c, i) => (
              <div
                key={c.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-500 ${
                  i === activeRate
                    ? "border-border bg-card text-foreground"
                    : "border-transparent text-foreground-subtle"
                }`}
              >
                <span>{c.flag}</span>
                <span className="font-medium">{CURRENCY_SYMBOLS[c.to]}</span>
                <span className="text-foreground-subtle text-xs">{c.to}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: "~3s", label: "Settlement" },
            { value: "0.1%", label: "Fee" },
            { value: "7+", label: "Corridors" },
          ].map(s => (
            <div key={s.label} className="text-center bg-card border border-border rounded-2xl py-6">
              <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-sm text-foreground-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-foreground-subtle uppercase tracking-[0.25em] mb-3">Products</p>
            <h2 className="text-3xl font-light tracking-tight">
              Built for <span className="font-serif italic">modern</span> payments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {([
              { href: "/send",    icon: <Globe className="w-6 h-6 text-foreground" />,    track: "Track 1", title: ["Cross-Border", "Payments"],  desc: "UAE to India, Pakistan, Philippines. Live FX rates, 0.1% fees, instant settlement." },
              { href: "/payroll", icon: <Users className="w-6 h-6 text-foreground" />,    track: "Track 1", title: ["Global", "Payroll"],          desc: "Upload CSV, pay your team worldwide in one click. On-chain receipts, zero bank delays." },
              { href: "/escrow",  icon: <Lock className="w-6 h-6 text-foreground" />,     track: "Track 2", title: ["Trade Finance", "Escrow"],    desc: "Lock USDC in escrow. Release automatically on milestone completion." },
              { href: "/invoice", icon: <FileText className="w-6 h-6 text-foreground" />, track: "Track 3", title: ["USDC", "Invoices"],           desc: "Create on-chain invoices and get paid in USDC. Instant settlement, no chargebacks." },
              { href: "/agent",   icon: <Bot className="w-6 h-6 text-foreground" />,      track: "Track 4", title: ["AI Payment", "Agent"],        desc: "Natural language payments via Claude. Describe a payment, AI executes it." },
            ] as { href: string; icon: React.ReactNode; track: string; title: [string, string]; desc: string }[]).map(({ href, icon, track, title, desc }) => (
              <Link key={href} href={href} className="group">
                <div className="h-full bg-card border border-border rounded-2xl p-7 hover:border-foreground/20 transition-all duration-200">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-foreground/8 flex items-center justify-center group-hover:bg-foreground/12 transition-colors">
                      {icon}
                    </div>
                    <span className="text-xs text-foreground-subtle">{track}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {title[0]} <span className="font-serif italic text-foreground-muted">{title[1]}</span>
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-5">{desc}</p>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted group-hover:text-foreground group-hover:gap-3 transition-all">
                    Open app <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Rates */}
      <section id="rates" className="px-6 pb-20">
        <div className="max-w-4xl mx-auto border border-border rounded-2xl p-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-xs text-foreground-subtle uppercase tracking-[0.2em] mb-1.5">Live Rates</p>
              <h3 className="text-2xl font-light">
                Real-time <span className="font-serif italic">FX</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Auto-updating
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CORRIDORS.map(c => {
              const r = fxRates[c.to] || 0;
              return (
                <div key={c.to} className="bg-background-secondary border border-border-subtle rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-2">{c.flag}</span>
                  <p className="text-xs text-foreground-muted mb-0.5">{c.name}</p>
                  <p className="text-base font-semibold">{CURRENCY_SYMBOLS[c.to]}{r.toFixed(2)}</p>
                  <p className="text-xs text-foreground-subtle">per $1</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
          <span>Built for Circle × Arc Hackathon 2025</span>
          <div className="flex items-center gap-6">
            <span>Arc Testnet · Chain 5042002</span>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
