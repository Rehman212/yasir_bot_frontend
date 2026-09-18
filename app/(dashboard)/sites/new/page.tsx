"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, Card } from "@/components/ui/primitives";
import { sitesApi, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Platform = "wordpress" | "shopify";

export default function NewSitePage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("wordpress");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [blogId, setBlogId] = useState("");
  const [blogs, setBlogs] = useState<{ id: string; title: string; handle: string }[]>(
    [],
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(testOnly = false) {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (platform === "shopify") {
        const res = await sitesApi.create({
          name,
          platform: "SHOPIFY",
          storeDomain: storeDomain.trim(),
          accessToken: accessToken.trim(),
          blogId: blogId.trim() || undefined,
        });

        if (res.blogs?.length) setBlogs(res.blogs);

        if (!res.connected) {
          setError(
            res.warning ||
              "Saved but Shopify rejected the token. Check store domain + Admin API access token.",
          );
          setMessage(`Saved as ${res.data.status}`);
          return;
        }

        setMessage(
          res.data.blogId
            ? `Connected. Using blog ID ${res.data.blogId}.`
            : "Connected successfully.",
        );
        if (!testOnly) router.push(`/sites/${res.data.id}`);
        return;
      }

      const res = await sitesApi.create({
        name,
        platform: "WORDPRESS",
        url: url.replace(/\/+$/, ""),
        username: username.trim(),
        applicationPassword: applicationPassword.replace(/\s+/g, ""),
      });

      if (res.data.status !== "CONNECTED" || res.connected === false) {
        setError(
          res.warning ||
            "Saved as DISCONNECTED — WordPress rejected the login. Check username + Application Password.",
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
          Connect WordPress or Shopify so SheetPress can publish blog posts.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setPlatform("wordpress");
            setError("");
            setMessage("");
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition",
            platform === "wordpress"
              ? "border-brand bg-brand-soft shadow-sm ring-2 ring-brand/20"
              : "border-border bg-surface hover:border-brand/40",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-foreground">WordPress</p>
            <Badge tone="success">Available</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Application Password → publish posts.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setPlatform("shopify");
            setError("");
            setMessage("");
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition",
            platform === "shopify"
              ? "border-accent bg-accent-soft shadow-sm ring-2 ring-accent/25"
              : "border-border bg-surface hover:border-accent/40",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-foreground">Shopify</p>
            <Badge tone="accent">Available</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Admin API token → publish to Shopify Blog.
          </p>
        </button>
      </div>

      {platform === "shopify" ? (
        <Card className="space-y-4 p-6">
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
            <p className="font-medium text-foreground">How to connect Shopify</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Shopify Admin → Settings → Apps and sales channels → Develop apps</li>
              <li>Create an app → Configure Admin API scopes</li>
              <li>
                Enable at least <code>read_content</code> and{" "}
                <code>write_content</code>
              </li>
              <li>Install app → copy <strong>Admin API access token</strong></li>
              <li>
                Store domain like <code>my-store.myshopify.com</code>
              </li>
            </ol>
          </div>
          <Input
            label="Website name"
            placeholder="My Shopify Blog"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Store domain"
            placeholder="my-store.myshopify.com"
            hint="myshopify.com domain (or paste full https URL)"
            value={storeDomain}
            onChange={(e) => setStoreDomain(e.target.value)}
            required
          />
          <Input
            label="Admin API access token"
            type="password"
            hint="Starts with shpat_… from your custom app"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required
          />
          <Input
            label="Blog ID (optional)"
            placeholder="Auto-select first blog"
            hint="Leave empty to use the first blog on the store"
            value={blogId}
            onChange={(e) => setBlogId(e.target.value)}
          />
          {blogs.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm">
              <p className="font-medium text-foreground">Blogs on this shop</p>
              <ul className="mt-2 space-y-1 text-muted">
                {blogs.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="text-left hover:text-brand"
                      onClick={() => setBlogId(b.id)}
                    >
                      {b.title} — <code>{b.id}</code> (/{b.handle})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
      ) : (
        <Card className="space-y-4 p-6">
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
            <p className="font-medium text-foreground">How to connect WordPress</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>
                Username = your WP login username (top-right “Howdy, …”) —{" "}
                <strong>not</strong> the app password name
              </li>
              <li>Users → Profile → Application Passwords</li>
              <li>
                Name it <code>SheetPress</code> → Add → copy the new password
              </li>
            </ol>
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Application password"
            type="password"
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
      )}
    </div>
  );
}
