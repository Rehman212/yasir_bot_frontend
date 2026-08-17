"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { sitesApi, type WpSite, getAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";

function statusLabel(status: string) {
  if (status === "CONNECTED") return "Connected";
  if (status === "NEEDS_RECONNECT") return "Needs reconnect";
  return "Disconnected";
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<WpSite[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await sitesApi.list();
      setSites(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load sites");
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    load();
  }, [router]);

  async function reconnect(id: string) {
    setBusyId(id);
    setError("");
    try {
      await sitesApi.test(id);
      await load();
    } catch (err: any) {
      setError(err.message || "Reconnect failed");
    } finally {
      setBusyId(null);
    }
  }

  async function removeSite(site: WpSite) {
    const ok = window.confirm(
      `Remove “${site.name}”? This deletes the connection from SheetPress (not your WordPress site).`,
    );
    if (!ok) return;
    setBusyId(site.id);
    setError("");
    try {
      await sitesApi.remove(site.id);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to remove site");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            WordPress Sites
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage connections, published totals, and reconnection status.
          </p>
        </div>
        <Button href="/sites/new">
          <Plus className="h-4 w-4" />
          Add website
        </Button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-muted">
              <tr>
                {[
                  "Website name",
                  "Domain",
                  "Status",
                  "Published",
                  "Last connected",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    No sites yet. Add your first WordPress connection.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/sites/${site.id}`} className="hover:text-brand">
                        {site.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {domainFromUrl(site.url)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusLabel(site.status)} />
                    </td>
                    <td className="px-4 py-3">{site.publishedCount}</td>
                    <td className="px-4 py-3 text-muted">
                      {site.lastConnectedAt
                        ? new Date(site.lastConnectedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button href={`/sites/${site.id}`} variant="ghost" size="sm">
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          disabled={busyId === site.id}
                          onClick={() => reconnect(site.id)}
                        >
                          {busyId === site.id ? "Working…" : "Reconnect"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="text-danger hover:text-danger"
                          disabled={busyId === site.id}
                          onClick={() => removeSite(site)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
