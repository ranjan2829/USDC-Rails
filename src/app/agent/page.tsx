"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Bot, User, ExternalLink, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Intent {
  recipient: string;
  amount: string;
  note: string;
  valid: boolean;
}

const EXAMPLES = [
  "Pay 5 USDC to 0x154212C94280f8277607c6f8052365c3F44782BC for logo design",
  "Send 10 USDC to 0x154212C94280f8277607c6f8052365c3F44782BC for consulting",
  "Transfer 2.5 USDC to 0x154212C94280f8277607c6f8052365c3F44782BC",
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [executing, setExecuting] = useState(false);
  const [txResult, setTxResult] = useState<{ id: string; status: string } | null>(null);

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");
    setIntent(null);
    setTxResult(null);

    const next: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setLoading(true);

    const r = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    }).then(r => r.json());

    setMessages(prev => [...prev, { role: "assistant", content: r.reply }]);
    if (r.intent?.valid) setIntent(r.intent);
    setLoading(false);
  }

  async function executePayment() {
    if (!intent) return;
    setExecuting(true);
    const r = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientAddress: intent.recipient,
        amount: intent.amount,
      }),
    }).then(r => r.json());

    if (r.error) {
      setMessages(prev => [...prev, { role: "assistant", content: `Payment failed: ${r.error}` }]);
    } else {
      setTxResult({ id: r.transactionId, status: r.status });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Payment executed. ${intent.amount} USDC sent to ${intent.recipient.slice(0, 10)}… Transaction ID: ${r.transactionId}`,
      }]);
      setIntent(null);
    }
    setExecuting(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <header className="border-b border-border glass sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-sm">AI Payment Agent</h1>
            <p className="text-xs text-foreground-muted">Natural language → USDC transfers</p>
          </div>
          <span className="text-xs font-medium text-foreground-muted border border-border px-3 py-1.5 rounded-full">Track 4</span>
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted border border-border px-3 py-1.5 rounded-full">
            <Zap className="w-3 h-3" />
            Claude
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-4 relative z-10">

        {/* Empty state with examples */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-foreground/6 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-7 h-7 text-foreground-muted" />
              </div>
              <h2 className="text-lg font-medium mb-2">AI Payment Agent</h2>
              <p className="text-foreground-muted text-sm max-w-sm">
                Describe any payment in plain English. I&apos;ll extract the details and execute the transfer.
              </p>
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs text-foreground-subtle uppercase tracking-wider text-center mb-3">Try an example</p>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => sendMessage(ex)}
                  className="w-full text-left bg-card border border-border hover:border-foreground/20 rounded-xl px-4 py-3 text-sm text-foreground-muted hover:text-foreground transition-all"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-foreground/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-foreground-muted" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-foreground"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-foreground/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-foreground-muted" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/8 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-foreground-muted" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />
                </div>
              </div>
            )}

            {/* Payment confirmation card */}
            {intent && (
              <div className="bg-card border border-border rounded-2xl p-5 ml-11">
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">Confirm Payment</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-muted">Amount</span>
                    <span className="text-sm font-semibold">{intent.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-muted">To</span>
                    <span className="text-sm font-mono">{intent.recipient.slice(0, 12)}…{intent.recipient.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-muted">Note</span>
                    <span className="text-sm">{intent.note}</span>
                  </div>
                </div>
                <button
                  onClick={executePayment}
                  disabled={executing}
                  className="w-full bg-foreground text-background rounded-xl py-3 font-semibold text-sm hover:opacity-85 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {executing ? "Executing…" : `Send ${intent.amount} USDC`}
                </button>
              </div>
            )}

            {txResult && (
              <div className="bg-card border border-border rounded-2xl p-4 ml-11">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <p className="text-sm font-medium text-success">Payment sent</p>
                </div>
                <a
                  href={`https://testnet.arcscan.app/tx/${txResult.id}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View on Arc Explorer
                </a>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 flex gap-3">
          <input
            type="text"
            placeholder="Pay 10 USDC to 0x... for design work"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-foreground/30 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-85 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
