"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi, setSession, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const data = res.data;
      setSession(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-muted">
        Log in to manage sites, imports, and your publishing queue.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-muted">
            <input type="checkbox" className="rounded border-border" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-brand hover:underline">
            Forgot password
          </Link>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Need an account? Contact your admin.
      </p>
    </div>
  );
}
