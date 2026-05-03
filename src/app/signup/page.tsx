"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Globe } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">USDC Rails</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-foreground-muted text-sm mb-8">A Circle wallet is created for you automatically.</p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-card border border-border hover:border-foreground/30 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-50 mb-6"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-foreground-subtle">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full name", key: "name", type: "text", placeholder: "Ali Hassan" },
            { label: "Email", key: "email", type: "email", placeholder: "ali@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-foreground-muted uppercase tracking-wide block mb-2">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required
                minLength={key === "password" ? 8 : undefined}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm placeholder-foreground-subtle/50 focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
          ))}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background rounded-xl py-3.5 font-semibold text-sm hover:opacity-85 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating wallet…</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-foreground-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
