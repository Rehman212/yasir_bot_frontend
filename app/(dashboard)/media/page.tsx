"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  ApiError,
  getAccessToken,
  mediaApi,
  sitesApi,
  type MediaAsset,
  type WpSite,
} from "@/lib/api";

function formatSize(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function prettyStatus(status: string) {
  if (status === "UPLOADED") return "Uploaded";
  if (status === "FAILED") return "Failed";
  if (status === "LINKED") return "Linked";
  if (status === "PENDING") return "Pending";
  return status;
}

export default function MediaPage() {
  const router = useRouter();
  const [sites, setSites] = useState<WpSite[]>([]);
  const [siteId, setSiteId] = useState("");
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(selectedSite?: string) {
    const res = await mediaApi.list(selectedSite || undefined);
    setItems(res.data);
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    sitesApi
      .list()
      .then((res) => {
        setSites(res.data);
        if (res.data[0]) setSiteId(res.data[0].id);
      })
      .catch((err) => setError(err.message || "Failed to load sites"));
    load().catch((err) => setError(err.message || "Failed to load media"));
  }, [router]);

  async function uploadUrl() {
    if (!siteId) {
      setError("Select a WordPress site first.");
      return;
    }
    if (!sourceUrl.trim()) {
      setError("Paste a direct image URL (https://...).");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await mediaApi.uploadFromUrl(siteId, sourceUrl.trim());
      setSourceUrl("");
      setMessage("Image uploaded to WordPress media library.");
      await load(siteId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function uploadLocal() {
    if (!siteId) {
      setError("Select a WordPress site first.");
      return;
    }
    if (!file) {
      setError("Choose an image file.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await mediaApi.uploadFile(siteId, file);
      setFile(null);
      setMessage("Image file uploaded to WordPress.");
      await load(siteId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function retry(id: string) {
    setBusyId(id);
    setError("");
    try {
      await mediaApi.retry(id);
      await load(siteId || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Retry failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this media record from SheetPress?")) return;
    setBusyId(id);
    try {
      await mediaApi.remove(id);
      await load(siteId || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="mt-1 text-sm text-muted">
          Upload images to WordPress, or put a full image URL in each article’s{" "}
          <strong>Featured Image</strong> column — SheetPress attaches it
          automatically on publish.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">How images get on posts</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>
            In your sheet, set <strong>Featured Image</strong> to a public URL
            like <code>https://example.com/photo.jpg</code> (not just{" "}
            <code>image.jpg</code>).
          </li>
          <li>
            On publish, SheetPress downloads that URL, uploads to WordPress, and
            sets it as the post featured image.
          </li>
          <li>
            This Media page is for manual uploads / retries — you do{" "}
            <em>not</em> need to manually link each Media item to each post if
            the sheet already has the URL.
          </li>
        </ol>
      </Card>

      <Card className="space-y-4 p-6">
        <Select
          label="WordPress site"
          value={siteId}
          onChange={(e) => {
            setSiteId(e.target.value);
            load(e.target.value).catch(() => undefined);
          }}
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.status})
            </option>
          ))}
        </Select>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Input
              label="Upload from image URL"
              placeholder="https://cdn.example.com/hero.jpg"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <Button type="button" disabled={loading} onClick={uploadUrl}>
              {loading ? "Uploading…" : "Upload URL to WordPress"}
            </Button>
          </div>
          <div className="space-y-3">
            <Input
              label="Or upload image file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={uploadLocal}
            >
              {loading ? "Uploading…" : "Upload file to WordPress"}
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-brand">{message}</p> : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.length === 0 ? (
          <Card className="p-5 sm:col-span-2 xl:col-span-4">
            <p className="text-sm text-muted">
              No media yet. Upload above, or publish an article that has a
              Featured Image URL in the sheet.
            </p>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-surface-muted text-sm text-muted">
                {item.sourceUrl?.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.sourceUrl}
                    alt={item.filename || "media"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "Preview"
                )}
              </div>
              <p className="mt-3 truncate text-sm font-semibold">
                {item.filename || item.sourceUrl}
              </p>
              <p className="mt-1 text-xs text-muted">
                WP ID: {item.wpMediaId ?? "—"} · {formatSize(item.sizeBytes)}
                {item.site?.name ? ` · ${item.site.name}` : ""}
              </p>
              {item.error ? (
                <p className="mt-1 text-xs text-danger">{item.error}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={prettyStatus(item.status)} />
                <div className="flex gap-1">
                  {item.sourceUrl?.startsWith("http") ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.sourceUrl);
                          setMessage("Image link copied.");
                          setError("");
                        } catch {
                          setError("Could not copy link. Copy manually from the URL.");
                        }
                      }}
                    >
                      Copy link
                    </Button>
                  ) : null}
                  {item.status === "FAILED" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => retry(item.id)}
                    >
                      Retry
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {item.sourceUrl?.startsWith("http") ? (
                <p className="mt-2 truncate text-[11px] text-muted" title={item.sourceUrl}>
                  {item.sourceUrl}
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
