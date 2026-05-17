"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Users, Zap, ExternalLink, TrendingUp,
  Lock, FileText, Bot, ShieldCheck, Banknote, ArrowUpRight, Globe,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Two-slash mark — rails / speed */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M5 17L10 3"  stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M11 17L16 3" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" opacity="0.35"/>
      </svg>
      <span className="text-[15px] tracking-[-0.02em] leading-none"
        style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}>
        USDC<span className="text-foreground-muted font-[500]"> Rails</span>
      </span>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────
const CORRIDORS = [
  { from: "AED", to: "INR", flag: "🇮🇳", name: "India",       symbol: "₹"  },
  { from: "AED", to: "PKR", flag: "🇵🇰", name: "Pakistan",    symbol: "Rs" },
  { from: "AED", to: "PHP", flag: "🇵🇭", name: "Philippines", symbol: "₱"  },
  { from: "AED", to: "BDT", flag: "🇧🇩", name: "Bangladesh",  symbol: "৳"  },
  { from: "AED", to: "GBP", flag: "🇬🇧", name: "UK",          symbol: "£"  },
  { from: "AED", to: "EUR", flag: "🇪🇺", name: "Europe",      symbol: "€"  },
  { from: "AED", to: "USD", flag: "🇺🇸", name: "USA",         symbol: "$"  },
];

const PRODUCTS = [
  {
    href: "/remittance", icon: Banknote,
    label: "Remittance",
    sub: "Send money home in seconds",
    accent: "from-amber-500/15 to-amber-500/5",
    border: "hover:border-amber-500/40",
    tag: "Popular",
  },
  {
    href: "/send", icon: Globe,
    label: "Cross-Border",
    sub: "UAE to anywhere, live FX rates",
    accent: "from-blue-500/15 to-blue-500/5",
    border: "hover:border-blue-500/40",
    tag: null,
  },
  {
    href: "/payroll", icon: Users,
    label: "Payroll",
    sub: "Pay teams worldwide via CSV",
    accent: "from-violet-500/15 to-violet-500/5",
    border: "hover:border-violet-500/40",
    tag: null,
  },
  {
    href: "/escrow", icon: Lock,
    label: "Escrow",
    sub: "Lock funds, release on milestone",
    accent: "from-emerald-500/15 to-emerald-500/5",
    border: "hover:border-emerald-500/40",
    tag: null,
  },
  {
    href: "/invoice", icon: FileText,
    label: "Invoices",
    sub: "Get paid in USDC, no chargebacks",
    accent: "from-rose-500/15 to-rose-500/5",
    border: "hover:border-rose-500/40",
    tag: null,
  },
  {
    href: "/agent", icon: Bot,
    label: "AI Agent",
    sub: "Type it. Claude executes it.",
    accent: "from-primary/15 to-primary/5",
    border: "hover:border-primary/40",
    tag: "Claude",
  },
];

const STATS = [
  { value: "~3s",  label: "Settlement" },
  { value: "0.1%", label: "Fee" },
  { value: "7+",   label: "Corridors" },
  { value: "$0",   label: "Minimum" },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const [fxRates, setFxRates]   = useState<Record<string, number>>({});
  const [active, setActive]     = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [sendAmt, setSendAmt]   = useState("1000");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(d => { if (d.rates) setFxRates(d.rates); })
      .catch(() => {});
    fetch("/api/me")
      .then(r => r.json())
      .then(d => { if (!d.error) setLoggedIn(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => setActive(p => (p + 1) % CORRIDORS.length), 3500);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const corridor   = CORRIDORS[active];
  const aedToUsd   = fxRates["AED"] ? 1 / fxRates["AED"] : 0.2723;
  const destRate   = fxRates[corridor.to] ?? 0;
  const usdcAmt    = parseFloat(sendAmt || "0") * aedToUsd;
  const recipientGets = destRate > 0 ? (usdcAmt * 0.999 * destRate) : null;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Ambient glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full bg-primary/4 blur-[180px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/4 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-blue-500/3 blur-[120px]" />
      </div>
      <div className="fixed inset-0 grid-bg opacity-[0.12] pointer-events-none" />

      {/* ─────────────────────── NAV ───────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40"
        style={{ background: "color-mix(in srgb, var(--background) 85%, transparent)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-foreground-muted">
            <a href="#products" className="hover:text-foreground transition-colors">Products</a>
            <a href="#rates"    className="hover:text-foreground transition-colors">Live Rates</a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1">
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Arc Testnet
            </div>
            {loggedIn ? (
              <Link href="/dashboard"
                className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity flex items-center gap-1.5">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm text-foreground-muted hover:text-foreground px-4 py-2 transition-colors">
                  Sign in
                </Link>
                <Link href="/signup"
                  className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity flex items-center gap-1.5">
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─────────────────────── HERO ───────────────────────────────────── */}
      <section className="relative pt-28 pb-0 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-center">
          <div className="grid lg:grid-cols-[1fr_440px] gap-12 xl:gap-20 items-center py-16">

            {/* ── Left: Copy ─────────────────────────────────────────── */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 text-xs text-foreground-muted border border-border bg-card/60 px-4 py-2 rounded-full mb-8 animate-slide-up">
                <Zap className="w-3 h-3 text-primary" />
                Built for Circle × Arc Hackathon 2025
              </div>

              {/* Headline */}
              <h1 className="mb-6 animate-slide-up stagger-1 space-y-1">
                <span
                  className="block leading-[0.88] tracking-[-0.035em] text-foreground-muted"
                  style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 68px)" }}>
                  The money transfer
                </span>
                <span
                  className="block leading-[0.88] tracking-[-0.035em] text-foreground"
                  style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 68px)" }}>
                  banks can&apos;t match.
                </span>
                <span
                  className="block font-serif italic leading-[1.1] text-gradient-teal"
                  style={{ fontSize: "clamp(32px, 4.2vw, 58px)" }}>
                  Instant. On-chain. 0.1%.
                </span>
              </h1>

              {/* Sub */}
              <p className="text-foreground-muted text-base leading-relaxed max-w-md mb-10 animate-slide-up stagger-2">
                Send USDC from UAE to 7+ countries. Live FX rates, settled on-chain
                in seconds. Western Union charges <span className="line-through text-foreground-subtle">4.5%</span> —
                we charge <span className="text-primary font-semibold">0.1%</span>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-12 animate-slide-up stagger-3">
                <Link href={loggedIn ? "/dashboard" : "/signup"}
                  className="group flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all glow-primary">
                  {loggedIn ? "Open Dashboard" : "Start for free"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a href="#products"
                  className="flex items-center gap-2 border border-border hover:border-foreground/30 text-foreground-muted hover:text-foreground px-7 py-3.5 rounded-full font-medium text-sm transition-all">
                  See products
                </a>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 animate-slide-up stagger-4">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
                    <p className="text-xs text-foreground-subtle mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Terminal Card ────────────────────────────────── */}
            <div className="animate-float hidden lg:block">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}>

                {/* Terminal header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-background-secondary">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/70" />
                      <div className="w-3 h-3 rounded-full bg-warning/70" />
                      <div className="w-3 h-3 rounded-full bg-success/70" />
                    </div>
                    <span className="text-xs text-foreground-subtle font-mono ml-1">usdc-rails · live</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    Arc Testnet
                  </div>
                </div>

                {/* Corridor selector tabs */}
                <div className="flex overflow-x-auto border-b border-border px-2 pt-2 gap-1 scrollbar-hide">
                  {CORRIDORS.slice(0, 5).map((c, i) => (
                    <button key={c.to}
                      onClick={() => { setActive(i); clearInterval(intervalRef.current!); }}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all ${
                        i === active
                          ? "bg-background text-foreground border border-border border-b-background -mb-px"
                          : "text-foreground-muted hover:text-foreground"
                      }`}>
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* Calculator body */}
                <div className="p-5 space-y-4">
                  {/* You send */}
                  <div className="bg-background-secondary rounded-xl p-4">
                    <p className="text-xs text-foreground-subtle mb-2 uppercase tracking-wider">You send (AED)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground-muted text-xl">د.إ</span>
                      <input
                        type="number"
                        value={sendAmt}
                        onChange={e => setSendAmt(e.target.value)}
                        className="bg-transparent text-3xl font-bold focus:outline-none w-full min-w-0 tracking-tight"
                      />
                    </div>
                    <p className="text-xs text-foreground-subtle mt-2">
                      ≈ ${usdcAmt.toFixed(2)} USDC
                    </p>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex items-center gap-3 px-1">
                    <div className="flex-1 h-px bg-border relative overflow-hidden">
                      <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-primary to-transparent animate-flow-line" />
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary font-semibold">
                      <Zap className="w-3 h-3" />0.1% fee
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Recipient gets */}
                  <div className="bg-background-secondary rounded-xl p-4">
                    <p className="text-xs text-foreground-subtle mb-2 uppercase tracking-wider">
                      {corridor.name} receives
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{corridor.flag}</span>
                      <div>
                        <p className="text-3xl font-bold tracking-tight text-primary">
                          {recipientGets
                            ? `${corridor.symbol}${recipientGets.toLocaleString("en", { maximumFractionDigits: 0 })}`
                            : "—"}
                        </p>
                        <p className="text-xs text-foreground-subtle mt-0.5">
                          {destRate > 0 ? `1 USD = ${corridor.symbol}${destRate.toFixed(2)}` : "Loading rate…"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: <Zap className="w-3.5 h-3.5" />,        label: "~3 sec",    sub: "Settlement" },
                      { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "On-chain",  sub: "Verifiable" },
                      { icon: <TrendingUp className="w-3.5 h-3.5" />,  label: "Live FX",   sub: "No spread" },
                    ].map(m => (
                      <div key={m.label} className="bg-background-secondary rounded-lg p-2.5">
                        <div className="flex justify-center text-primary mb-1">{m.icon}</div>
                        <p className="text-xs font-semibold">{m.label}</p>
                        <p className="text-[10px] text-foreground-subtle">{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  <Link href={loggedIn ? "/remittance" : "/signup"}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity glow-primary">
                    {loggedIn ? "Send now" : "Create free account"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-subtle animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-border to-transparent" />
        </div>
      </section>

      {/* ──────────────── FX TICKER TAPE ────────────────────────────────── */}
      <div className="border-y border-border bg-background-secondary overflow-hidden py-3 relative z-10">
        <div className="flex animate-marquee whitespace-nowrap" aria-hidden>
          {[...CORRIDORS, ...CORRIDORS, ...CORRIDORS, ...CORRIDORS].map((c, i) => {
            const r = fxRates[c.to];
            return (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-foreground-muted">
                <span>{c.flag}</span>
                <span className="font-mono">AED → {c.to}</span>
                <span className="text-foreground font-semibold font-mono">
                  {r ? `${c.symbol}${(r * 0.2723).toFixed(2)}` : "—"}
                </span>
                <span className="text-border mx-4 select-none">·</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ────────────────── PRODUCTS ────────────────────────────────────── */}
      <section id="products" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border max-w-[40px]" />
              <span className="text-xs text-foreground-subtle uppercase tracking-[0.3em]">Products</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] leading-tight max-w-lg">
              Everything to<br />
              <span className="font-serif italic text-foreground-muted">move money</span> globally
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.map(({ href, icon: Icon, label, sub, accent, border, tag }) => (
              <Link key={href} href={href}
                className={`group relative bg-card border border-border ${border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg overflow-hidden`}>
                {/* Accent gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-11 h-11 rounded-xl bg-foreground/8 group-hover:bg-foreground/12 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" />
                    </div>
                    {tag && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{label}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-5">{sub}</p>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-subtle group-hover:text-foreground group-hover:gap-2.5 transition-all">
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── WHY USDC RAILS ──────────────────────────────── */}
      <section className="py-24 px-6 relative z-10 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {[
              {
                icon: <TrendingUp className="w-6 h-6" />,
                label: "Live FX, no spread",
                desc: "Rates pulled in real-time from open exchange data. No hidden markup, no spread. What you see is what they get.",
                accent: "text-amber-400",
                bg: "bg-card",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                label: "~3 second finality",
                desc: "Settled on Circle's Arc L1. No T+2, no weekend delays, no bank holidays. Transactions confirm before you close the tab.",
                accent: "text-primary",
                bg: "bg-card",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                label: "On-chain & verifiable",
                desc: "Every transfer has a transaction ID. Verify on Arc Explorer in one click. Your money, fully auditable.",
                accent: "text-blue-400",
                bg: "bg-card",
              },
            ].map(f => (
              <div key={f.label} className={`${f.bg} p-8`}>
                <div className={`mb-5 ${f.accent}`}>{f.icon}</div>
                <h3 className="font-semibold text-lg mb-3">{f.label}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── LIVE RATES ──────────────────────────────────── */}
      <section id="rates" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border max-w-[40px]" />
                <span className="text-xs text-foreground-subtle uppercase tracking-[0.3em]">Live Rates</span>
              </div>
              <h2 className="text-4xl font-light tracking-tight">
                Real-time <span className="font-serif italic text-foreground-muted">FX</span>
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Auto-updating
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CORRIDORS.map(c => {
              const r = fxRates[c.to] ?? 0;
              return (
                <Link key={c.to} href="/send"
                  className="group bg-card border border-border hover:border-foreground/20 rounded-2xl p-5 text-center transition-all hover:shadow-lg">
                  <span className="text-3xl block mb-3">{c.flag}</span>
                  <p className="text-xs text-foreground-subtle mb-0.5">{c.name}</p>
                  <p className="text-base font-bold tracking-tight">
                    {c.symbol}{r > 0 ? r.toFixed(2) : "—"}
                  </p>
                  <p className="text-[10px] text-foreground-subtle mt-0.5">per $1</p>
                  <div className="mt-3 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    Send <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────── CTA BANNER ──────────────────────────────────── */}
      <section className="px-6 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-12 md:p-16 text-center">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-amber-500/6 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative">
              <p className="text-xs text-foreground-subtle uppercase tracking-[0.3em] mb-4">Get started</p>
              <h2 className="text-4xl md:text-6xl font-light tracking-[-0.03em] mb-4">
                Your first transfer<br />
                <span className="font-serif italic text-gradient-teal">takes 2 minutes.</span>
              </h2>
              <p className="text-foreground-muted max-w-md mx-auto mb-10 text-lg">
                Create an account, get your Circle wallet, and start sending USDC globally — all in one flow.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href={loggedIn ? "/dashboard" : "/signup"}
                  className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-base hover:opacity-90 transition-all glow-primary">
                  {loggedIn ? "Open Dashboard" : "Create free account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm transition-colors">
                  View Arc Explorer <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-foreground-subtle text-sm">·</span>
            <span className="text-sm text-foreground-muted">Circle × Arc Hackathon 2025</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-foreground-muted">
            <span className="font-mono text-xs">Chain 5042002</span>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1">
              Arc Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="/login"  className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
