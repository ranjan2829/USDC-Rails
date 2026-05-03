"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };
  const isPasswordValid = passwordStrength.length && passwordStrength.uppercase && passwordStrength.number;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed || !isPasswordValid) return;
    
    setLoading(true);
    setError("");
    
    // Simulate signup - replace with actual auth
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    
    // For demo, redirect to send page
    window.location.href = "/send";
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl glow-primary">
              <span className="text-primary-foreground font-serif font-bold text-2xl">R</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">USDC Rails</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Create your <span className="font-serif italic text-foreground-muted">account</span>
          </h1>
          <p className="text-foreground-muted">Start sending money globally in minutes</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up stagger-1">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground placeholder-foreground-subtle focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground placeholder-foreground-subtle focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a strong password"
                required
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pr-12 text-foreground placeholder-foreground-subtle focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength */}
            {form.password && (
              <div className="mt-3 space-y-2">
                {[
                  { check: passwordStrength.length, text: "At least 8 characters" },
                  { check: passwordStrength.uppercase, text: "One uppercase letter" },
                  { check: passwordStrength.number, text: "One number" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        item.check ? "bg-success text-success-foreground" : "bg-border"
                      }`}
                    >
                      {item.check && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className={item.check ? "text-foreground" : "text-foreground-muted"}>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-border bg-card accent-primary"
            />
            <span className="text-sm text-foreground-muted leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !agreed || !isPasswordValid}
            className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl py-4 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 animate-slide-up stagger-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-foreground-muted">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up stagger-3">
          <button className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3.5 hover:bg-card-hover hover:border-foreground-subtle/30 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3.5 hover:bg-card-hover hover:border-foreground-subtle/30 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-foreground-muted mt-8 animate-slide-up stagger-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
