"use client";

import { useEffect, useMemo, useState } from "react";
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

const MAX_BATCH_UPLOAD = 10;

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
  const [quota, setQuota] = useState({ used: 0, limit: 50 });
  const [sourceUrl, setSourceUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const allSelected = useMemo(
    () => items.length > 0 && selected.size === items.length,
    [items, selected],
  );

  async function load(selectedSite?: string) {
    const res = await mediaApi.list(selectedSite || undefined);
    setItems(res.data);
    setSelected(new Set());
    if (res.meta) {
      setQuota({ used: res.meta.used, limit: res.meta.limit });
    }
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

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(items.map((i) => i.id)));
  }

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
    if (!files.length) {
      setError("Choose one or more WebP image files.");
      return;
    }
    if (files.length > MAX_BATCH_UPLOAD) {
      setError(`You can upload at most ${MAX_BATCH_UPLOAD} images at a time.`);
      return;
    }

    const remaining = Math.max(0, quota.limit - quota.used);
    if (remaining <= 0) {
      setError(
        `Media limit reached (${quota.limit}). Delete images first to free space.`,
      );
      return;
    }

    const batch = files.slice(0, Math.min(MAX_BATCH_UPLOAD, remaining));
    setLoading(true);
    setError("");
    setMessage("");

    let ok = 0;
    const failures: string[] = [];
    for (const file of batch) {
      try {
        await mediaApi.uploadFile(siteId, file);
        ok += 1;
      } catch (err) {
        failures.push(
          `${file.name}: ${err instanceof ApiError ? err.message : "failed"}`,
        );
      }
    }

    setFiles([]);
    await load(siteId);
    if (ok) {
      setMessage(
        `Uploaded ${ok} image${ok === 1 ? "" : "s"}${
          files.length > batch.length
            ? ` (capped by library space / max ${MAX_BATCH_UPLOAD})`
            : ""
        }.`,
      );
    }
    if (failures.length) {
      setError(failures.slice(0, 3).join(" · "));
    }
    setLoading(false);
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
    if (
      !window.confirm(
        "Delete this image from SheetPress and WordPress media library?",
      )
    )
      return;
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

  async function deleteSelected() {
    const ids = [...selected];
    if (!ids.length) {
      setError("Select at least one image to delete.");
      return;
    }
    if (
      !window.confirm(
        `Delete ${ids.length} selected image(s) from SheetPress and WordPress?`,
      )
    )
      return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await mediaApi.removeMany(ids);
      setMessage(
        `Deleted ${res.data.deleted} image${res.data.deleted === 1 ? "" : "s"}.`,
      );
      await load(siteId || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Bulk delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAll() {
    if (!items.length) return;
    if (
      !window.confirm(
        `Delete ALL ${items.length} listed image(s) from SheetPress and WordPress?`,
      )
    )
      return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await mediaApi.removeMany(items.map((i) => i.id));
      setMessage(`Deleted ${res.data.deleted} image(s).`);
      await load(siteId || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete all failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="mt-1 text-sm text-muted">
          Library limit: <strong>{quota.used}/{quota.limit}</strong> images ·
          WebP only · under 100KB · up to <strong>{MAX_BATCH_UPLOAD}</strong>{" "}
          files per upload. Sheet featured-image URLs on publish are separate.
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
              label="Upload from WebP image URL"
              placeholder="https://cdn.example.com/hero.webp"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <Button
              type="button"
              disabled={loading || quota.used >= quota.limit}
              onClick={uploadUrl}
            >
              {loading ? "Uploading…" : "Upload URL to WordPress"}
            </Button>
          </div>
          <div className="space-y-3">
            <Input
              label={`Upload WebP files (max ${MAX_BATCH_UPLOAD} at a time, 100KB each)`}
              type="file"
              accept="image/webp,.webp"
              multiple
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                setFiles(list.slice(0, MAX_BATCH_UPLOAD));
                if (list.length > MAX_BATCH_UPLOAD) {
                  setError(
                    `Only the first ${MAX_BATCH_UPLOAD} files will be uploaded.`,
                  );
                }
              }}
            />
            {files.length ? (
              <p className="text-xs text-muted">
                Selected: {files.length} file{files.length === 1 ? "" : "s"}
              </p>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              disabled={loading || quota.used >= quota.limit || !files.length}
              onClick={uploadLocal}
            >
              {loading
                ? "Uploading…"
                : `Upload ${files.length || ""} file${
                    files.length === 1 ? "" : "s"
                  } to WordPress`.replace(/\s+/g, " ").trim()}
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-brand">{message}</p> : null}
      </Card>

      {items.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
            Select all ({items.length})
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || selected.size === 0}
            onClick={deleteSelected}
          >
            Delete selected ({selected.size})
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={loading}
            onClick={deleteAll}
          >
            Delete all
          </Button>
        </div>
      ) : null}

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
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selected.has(item.id)}
                    onChange={() => toggleOne(item.id)}
                  />
                  Select
                </label>
              </div>
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
                          setError(
                            "Could not copy link. Copy manually from the URL.",
                          );
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
                <p
                  className="mt-2 truncate text-[11px] text-muted"
                  title={item.sourceUrl}
                >
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
