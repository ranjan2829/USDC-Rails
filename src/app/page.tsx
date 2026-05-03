import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-black">S</div>
          <span className="font-semibold tracking-tight">SwiftSettle</span>
        </div>
        <div className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Live on Arc Testnet
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <div className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 rounded-full mb-8">
            Built on Arc L1 · Circle USDC · ~3s finality
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
            Move money anywhere.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Instantly. On-chain.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Cross-border payments, payroll, and trade finance — all powered by USDC on Arc L1. 0.1% fee. No banks.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-14 max-w-2xl mx-auto">
          {[
            { value: "~3s", label: "Settlement time" },
            { value: "0.1%", label: "Platform fee" },
            { value: "7+", label: "Corridors" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/[0.03] border border-white/5 rounded-2xl py-5">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Send */}
          <Link href="/send">
            <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">
                  🌍
                </div>
                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                  Track 1
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Send USDC</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                UAE to India, Pakistan, Philippines and more. Pay in AED or USD. See live FX rates.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm text-blue-400 group-hover:gap-2.5 transition-all">
                Open <span>→</span>
              </div>
            </div>
          </Link>

          {/* Payroll */}
          <Link href="/payroll">
            <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-violet-500/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center text-xl">
                  💸
                </div>
                <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-full">
                  Track 1 · Payroll
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Global Payroll</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Upload a CSV. Pay contractors and employees worldwide in one click. On-chain receipts.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm text-violet-400 group-hover:gap-2.5 transition-all">
                Open <span>→</span>
              </div>
            </div>
          </Link>

          {/* Escrow - coming soon */}
          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 opacity-50">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                🤝
              </div>
              <span className="text-xs font-medium text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded-full">
                Track 2 · Soon
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Trade Finance Escrow</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Lock USDC in escrow. Release on milestone completion. Trustless SME trade finance.
            </p>
          </div>

          {/* AI Agent - coming soon */}
          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 opacity-50">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
                🤖
              </div>
              <span className="text-xs font-medium text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded-full">
                Track 4 · Soon
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Payment Agent</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Autonomous agent that orchestrates cross-border payments using Claude + USDC micropayments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 py-8 flex items-center justify-between text-xs text-gray-600">
          <span>Built for Circle × Arc Hackathon 2025</span>
          <div className="flex items-center gap-4">
            <span>Arc Testnet · Chain ID 5042002</span>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition">
              Explorer ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
