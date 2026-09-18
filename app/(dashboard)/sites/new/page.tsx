"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/primitives";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Websites
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">
            Add website
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Connect WordPress or Shopify so SheetPress can publish blog posts.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
        <button
          type="button"
          onClick={() => {
            setPlatform("wordpress");
            setError("");
            setMessage("");
          }}
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition",
            platform === "wordpress"
              ? "border-brand bg-brand-soft shadow-sm ring-2 ring-brand/20"
              : "border-border/80 bg-white/70 hover:border-brand/40",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/25">
            <Globe2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">WordPress</span>
              <Badge tone="success">Available</Badge>
            </span>
            <span className="mt-1 block text-sm text-muted">
              Application Password → publish posts.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPlatform("shopify");
            setError("");
            setMessage("");
          }}
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition",
            platform === "shopify"
              ? "border-accent bg-accent-soft shadow-sm ring-2 ring-accent/25"
              : "border-border/80 bg-white/70 hover:border-accent/40",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#95bf47] to-[#5e8e3e] text-white shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Shopify</span>
              <Badge tone="accent">Available</Badge>
            </span>
            <span className="mt-1 block text-sm text-muted">
              Admin API token → publish to Shopify Blog.
            </span>
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-8">
        <aside className="rounded-2xl border border-border/70 bg-[var(--sidebar)] p-5 text-slate-300 shadow-lg shadow-black/10 lg:sticky lg:top-24 lg:self-start">
          {platform === "shopify" ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Setup guide
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-outfit)] text-lg font-semibold text-white">
                How to connect Shopify
              </h2>
              <ol className="mt-4 list-decimal space-y-2.5 pl-4 text-sm leading-relaxed text-slate-400">
                <li>Shopify Admin → Settings → Apps and sales channels → Develop apps</li>
                <li>Create an app → Configure Admin API scopes</li>
                <li>
                  Enable at least <code className="text-accent">read_content</code> and{" "}
                  <code className="text-accent">write_content</code>
                </li>
                <li>
                  Install app → copy <strong className="text-white">Admin API access token</strong>
                </li>
                <li>
                  Store domain like{" "}
                  <code className="text-accent">my-store.myshopify.com</code>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Setup guide
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-outfit)] text-lg font-semibold text-white">
                How to connect WordPress
              </h2>
              <ol className="mt-4 list-decimal space-y-2.5 pl-4 text-sm leading-relaxed text-slate-400">
                <li>
                  Username = your WP login username (top-right “Howdy, …”) —{" "}
                  <strong className="text-white">not</strong> the app password name
                </li>
                <li>Users → Profile → Application Passwords</li>
                <li>
                  Name it <code className="text-accent">SheetPress</code> → Add → copy the
                  new password
                </li>
              </ol>
            </>
          )}
        </aside>

        <div className="space-y-5 rounded-2xl border border-border/80 bg-white/90 p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <div>
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold tracking-tight">
              Connection details
            </h2>
            <p className="mt-1 text-sm text-muted">
              {platform === "shopify"
                ? "Enter your Shopify store credentials below."
                : "Enter your WordPress site credentials below."}
            </p>
          </div>

          {platform === "shopify" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Website name"
                  placeholder="My Shopify Blog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Store domain"
                  placeholder="my-store.myshopify.com"
                  hint="myshopify.com domain (or paste full https URL)"
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Admin API access token"
                  type="password"
                  hint="Starts with shpat_… from your custom app"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Blog ID (optional)"
                  placeholder="Auto-select first blog"
                  hint="Leave empty to use the first blog on the store"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                />
              </div>
              {blogs.length > 0 ? (
                <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm sm:col-span-2">
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
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Website name"
                  placeholder="Growth Lab Blog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="WordPress URL"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
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
            </div>
          )}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-brand">{message}</p> : null}

          <div className="flex flex-wrap gap-3 border-t border-border/70 pt-5">
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
        </div>
      </div>
    </div>
  );
}
