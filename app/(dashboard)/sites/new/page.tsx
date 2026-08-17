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
      const res = (await sitesApi.create({
        name,
        url: url.replace(/\/+$/, ""),
        username: username.trim(),
        applicationPassword: applicationPassword.replace(/\s+/g, ""),
      })) as {
        data: { status: string; id: string };
        warning?: string;
        connected?: boolean;
      };

      if (res.data.status !== "CONNECTED" || res.connected === false) {
        setError(
          res.warning ||
            "Saved as DISCONNECTED — WordPress rejected the login. Check username + Application Password below.",
        );
        setMessage(`Saved as ${res.data.status}`);
        return;
      }

      if (testOnly) {
        setMessage("Connected successfully.");
      } else {
        router.push(`/sites/${res.data.id}`);
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
          <p className="font-medium text-foreground">How to connect</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>
              Username = your WP login username (top-right “Howdy, …”), e.g.{" "}
              <code>Admin</code> — <strong>not</strong> the app password name
            </li>
            <li>Users → Profile → Application Passwords</li>
            <li>
              Name it <code>SheetPress</code> → Add → copy the{" "}
              <strong>new generated password</strong> (xxxx xxxx xxxx xxxx)
            </li>
            <li>Paste that password below (spaces optional)</li>
          </ol>
          <p className="mt-2">
            Site URL like <code>https://socialvelocityy.com</code> (no{" "}
            <code>/wp-admin</code>).
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
          label="WordPress username"
          placeholder="Admin"
          hint="Your login username (Howdy, Admin) — not the Application Password name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Application password"
          type="password"
          hint="Fresh password from Users → Profile → Application Passwords — not your wp-admin password"
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
