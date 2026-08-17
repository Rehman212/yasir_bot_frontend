"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import { sitesApi, ApiError } from "@/lib/api";

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(testOnly = false) {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await sitesApi.create({
        name,
        url,
        username,
        applicationPassword,
      });
      if (testOnly) {
        setMessage(`Saved as ${res.data.status}`);
      } else {
        router.push("/sites");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save site");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Add website
        </h1>
        <p className="mt-1 text-sm text-muted">
          Connect with a WordPress <strong>Application Password</strong>—not
          your normal wp-admin login password.
        </p>
      </div>
      <Card className="space-y-4 p-6">
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">How to create one</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>WordPress admin → Users → Profile (or your user)</li>
            <li>Scroll to <strong>Application Passwords</strong></li>
            <li>Name it e.g. <code>SheetPress</code> → Add New Application Password</li>
            <li>Copy the generated password (spaces optional) into the field below</li>
          </ol>
          <p className="mt-2">
            Username can be your WP username or email. Site URL should be like{" "}
            <code>https://yasirbhatti.com</code> (no <code>/wp-admin</code>).
          </p>
        </div>
        <Input
          label="Website name"
          placeholder="Growth Lab Blog"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="WordPress URL"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Input
          label="Username"
          placeholder="editor or you@email.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Application password"
          type="password"
          hint="Not your normal WordPress login password"
          value={applicationPassword}
          onChange={(e) => setApplicationPassword(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-brand">{message}</p> : null}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => save(true)}
          >
            Test & save
          </Button>
          <Button type="button" disabled={loading} onClick={() => save(false)}>
            {loading ? "Saving…" : "Save connection"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
