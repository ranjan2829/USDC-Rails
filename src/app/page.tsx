import Link from "next/link";
import { ArrowRight, Globe, Users, Shield, Zap, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">R</span>
            </div>
            <span className="font-semibold tracking-tight text-lg">USDC Rails</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 text-sm bg-success/10 text-success px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="font-medium">Live on Arc Testnet</span>
            </div>
            <Link 
              href="/send"
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-sm text-foreground-muted border border-border bg-card px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4 text-accent" />
            Built on Circle Arc L1 with USDC
          </div>
          
          {/* Main Headline - Mixed Typography */}
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
            Move money{" "}
            <span className="font-serif italic text-foreground-muted">anywhere,</span>
            <br />
            settle{" "}
            <span className="font-serif italic text-accent">instantly.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10">
            Cross-border payments, global payroll, and trade finance infrastructure 
            powered by USDC. Real-time settlement with 0.1% fees.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/send"
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Start Sending
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="https://developers.circle.com/w3s/docs/arc-overview"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto border border-border bg-card text-foreground px-8 py-4 rounded-full text-base font-medium hover:border-foreground-subtle transition-colors flex items-center justify-center gap-2"
            >
              Read Docs
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "~3s", label: "Settlement" },
              { value: "0.1%", label: "Platform Fee" },
              { value: "7+", label: "Corridors" },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="text-center bg-card border border-border rounded-2xl py-6 px-4"
              >
                <p className="text-3xl md:text-4xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-sm text-foreground-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-3">
              <span className="font-serif italic text-foreground-muted">Everything</span> you need
            </h2>
            <p className="text-foreground-muted">Purpose-built rails for modern payments</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Send USDC */}
            <Link href="/send" className="group">
              <div className="h-full bg-card border border-border rounded-3xl p-8 hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Globe className="w-7 h-7 text-accent" />
                  </div>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                    Track 1
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Cross-Border <span className="font-serif italic text-foreground-muted">Payments</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Send USDC from UAE to India, Pakistan, Philippines and more. Live FX rates, transparent fees, instant settlement.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
                  Open app
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Global Payroll */}
            <Link href="/payroll" className="group">
              <div className="h-full bg-card border border-border rounded-3xl p-8 hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-accent" />
                  </div>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                    Track 1
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Global <span className="font-serif italic text-foreground-muted">Payroll</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Upload a CSV, pay your team worldwide in one click. On-chain receipts, automated compliance, zero bank delays.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
                  Open app
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Trade Finance - Coming Soon */}
            <div className="group opacity-60 cursor-not-allowed">
              <div className="h-full bg-card border border-border rounded-3xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-foreground-subtle/10 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-foreground-subtle" />
                  </div>
                  <span className="text-xs font-medium text-foreground-muted bg-background-secondary px-3 py-1.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Trade Finance <span className="font-serif italic text-foreground-muted">Escrow</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Lock USDC in smart escrow. Release on milestone completion. Trustless SME trade finance infrastructure.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium">
                  Track 2
                </div>
              </div>
            </div>

            {/* AI Agent - Coming Soon */}
            <div className="group opacity-60 cursor-not-allowed">
              <div className="h-full bg-card border border-border rounded-3xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-foreground-subtle/10 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-foreground-subtle" />
                  </div>
                  <span className="text-xs font-medium text-foreground-muted bg-background-secondary px-3 py-1.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  AI Payment <span className="font-serif italic text-foreground-muted">Agent</span>
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Autonomous agent that orchestrates cross-border payments. AI-powered negotiations with USDC micropayments.
                </p>
                <div className="flex items-center gap-2 text-foreground-muted font-medium">
                  Track 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center">
            <p className="text-sm text-foreground-muted uppercase tracking-widest mb-4">Powered By</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3772FF] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <span className="font-medium">Circle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2775CA] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="font-medium">USDC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background text-xs font-bold">A</span>
                </div>
                <span className="font-medium">Arc L1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-sm">R</span>
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
