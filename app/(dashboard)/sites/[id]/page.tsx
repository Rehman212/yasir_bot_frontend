"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  ApiError,
  articlesApi,
  getAccessToken,
  sitesApi,
  type ArticleRow,
  type WpSite,
} from "@/lib/api";

function statusLabel(status: string) {
  if (status === "CONNECTED") return "Connected";
  if (status === "NEEDS_RECONNECT") return "Needs reconnect";
  return "Disconnected";
}

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [site, setSite] = useState<WpSite | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [siteRes, articlesRes] = await Promise.all([
      sitesApi.get(id),
      articlesApi.list({ siteId: id }),
    ]);
    setSite(siteRes.data);
    setUsername(siteRes.data.username || "");
    setArticles(articlesRes.data.slice(0, 8));
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    load().catch((err) => setError(err.message || "Failed to load site"));
  }, [id, router]);

  async function saveCredentials() {
    if (!applicationPassword.trim()) {
      setError("Paste a new Application Password first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sitesApi.update(id, {
        username: username || undefined,
        applicationPassword: applicationPassword.trim(),
      });
      const tested = await sitesApi.test(id);
      const next = tested.data.site ?? (tested.data as WpSite);
      setSite(next);
      setApplicationPassword("");
      setMessage("Credentials updated and connection tested.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
      await load().catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }

  async function removeSite() {
    if (!site) return;
    const ok = window.confirm(
      `Remove “${site.name}”? This deletes the connection from SheetPress (not your WordPress site).`,
    );
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await sitesApi.remove(id);
      router.push("/sites");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove site");
      setLoading(false);
    }
  }

  if (!site) {
    return <p className="text-sm text-muted">{error || "Loading site…"}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            {site.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{site.url}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={statusLabel(site.status)} />
          <Button href="/sites" variant="ghost" size="sm">
            Back
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="button"
            disabled={loading}
            onClick={removeSite}
          >
            Remove
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Connection settings</h2>
        <p className="text-sm text-muted">
          SheetPress needs a WordPress <strong>Application Password</strong>, not
          your normal login password. Create one under Users → Profile →
          Application Passwords, then paste it here and reconnect.
        </p>
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="New application password"
          type="password"
          hint="Generated in WordPress — not your wp-admin password"
          value={applicationPassword}
          onChange={(e) => setApplicationPassword(e.target.value)}
        />
        <Button type="button" disabled={loading} onClick={saveCredentials}>
          {loading ? "Updating…" : "Update & reconnect"}
        </Button>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent articles</h2>
          <Link href="/articles" className="text-sm font-medium text-brand">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          {articles.length === 0 ? (
            <li className="text-muted">No articles for this site yet.</li>
          ) : (
            articles.map((article) => (
              <li key={article.id} className="flex justify-between gap-3">
                <span>{article.title}</span>
                <StatusBadge status={article.status} />
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
