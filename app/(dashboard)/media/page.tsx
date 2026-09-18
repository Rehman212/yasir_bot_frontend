"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** How many files to upload in one wave when library slots are free. */
const BATCH_SIZE = 100;

type QueueStatus = "queued" | "uploading" | "done" | "failed";

type QueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  error?: string;
};

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

function queueBadge(status: QueueStatus) {
  if (status === "queued") return "QUEUED";
  if (status === "uploading") return "PENDING";
  if (status === "done") return "UPLOADED";
  return "FAILED";
}

export default function MediaPage() {
  const router = useRouter();
  const [sites, setSites] = useState<WpSite[]>([]);
  const [siteId, setSiteId] = useState("");
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [quota, setQuota] = useState({ used: 0, limit: 2000 });
  const [sourceUrl, setSourceUrl] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processingRef = useRef(false);
  const siteIdRef = useRef(siteId);
  const quotaRef = useRef(quota);
  const queueRef = useRef<QueueItem[]>([]);

  useEffect(() => {
    siteIdRef.current = siteId;
  }, [siteId]);
  useEffect(() => {
    quotaRef.current = quota;
  }, [quota]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const allSelected = useMemo(
    () => items.length > 0 && selected.size === items.length,
    [items, selected],
  );

  const queueCounts = useMemo(() => {
    const counts = { queued: 0, uploading: 0, done: 0, failed: 0 };
    for (const q of queue) counts[q.status] += 1;
    return counts;
  }, [queue]);

  const load = useCallback(async (selectedSite?: string) => {
    const res = await mediaApi.list(selectedSite || undefined);
    setItems(res.data);
    setSelected(new Set());
    if (res.meta) {
      const next = { used: res.meta.used, limit: res.meta.limit };
      setQuota(next);
      quotaRef.current = next;
      return next;
    }
    return quotaRef.current;
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    const currentSite = siteIdRef.current;
    if (!currentSite) {
      setError("Select a WordPress site first.");
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    setError("");

    try {
      let latestQuota = quotaRef.current;

      while (true) {
        const slots = Math.max(0, latestQuota.limit - latestQuota.used);
        const waiting = queueRef.current.filter((q) => q.status === "queued");

        if (!waiting.length) {
          setMessage(
            `Queue empty. Library ${latestQuota.used}/${latestQuota.limit}.`,
          );
          break;
        }

        if (slots <= 0) {
          setMessage(
            `Library full (${latestQuota.used}/${latestQuota.limit}). Delete images in SheetPress — next ${BATCH_SIZE} from queue will upload automatically.`,
          );
          break;
        }

        const wave = waiting.slice(0, Math.min(BATCH_SIZE, slots));
        const waveIds = new Set(wave.map((w) => w.id));

        setQueue((prev) => {
          const next = prev.map((q) =>
            waveIds.has(q.id) ? { ...q, status: "uploading" as const } : q,
          );
          queueRef.current = next;
          return next;
        });

        let uploaded = 0;
        for (const item of wave) {
          try {
            await mediaApi.uploadFile(currentSite, item.file);
            uploaded += 1;
            setQueue((prev) => {
              const next = prev.map((q) =>
                q.id === item.id ? { ...q, status: "done" as const } : q,
              );
              queueRef.current = next;
              return next;
            });
          } catch (err) {
            const msg =
              err instanceof ApiError ? err.message : "Upload failed";
            setQueue((prev) => {
              const next = prev.map((q) =>
                q.id === item.id
                  ? { ...q, status: "failed" as const, error: msg }
                  : q,
              );
              queueRef.current = next;
              return next;
            });
          }
        }

        latestQuota = await load(currentSite);
        const stillWaiting = queueRef.current.filter(
          (q) => q.status === "queued",
        ).length;
        setMessage(
          `Batch done: ${uploaded}/${wave.length} uploaded. Library ${latestQuota.used}/${latestQuota.limit}. Waiting in queue: ${stillWaiting}.`,
        );

        if (
          stillWaiting === 0 ||
          latestQuota.limit - latestQuota.used <= 0
        ) {
          break;
        }
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [load]);

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
  }, [router, load]);

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

  function enqueueSelectedFiles(list: File[]) {
    if (!list.length) return;
    const now = Date.now();
    const additions: QueueItem[] = list.map((file, i) => ({
      id: `${now}-${i}-${file.name}`,
      file,
      status: "queued",
    }));
    setQueue((prev) => {
      const next = [...prev, ...additions];
      queueRef.current = next;
      return next;
    });
    setMessage(
      `Added ${additions.length} file(s) to queue. Uploading up to ${BATCH_SIZE} now; rest wait until you free library slots (delete).`,
    );
    setError("");
    setTimeout(() => {
      processQueue().catch(() => undefined);
    }, 50);
  }

  async function remove(id: string) {
    if (
      !window.confirm(
        "Remove this image from SheetPress only? (WordPress media stays unchanged)",
      )
    )
      return;
    setBusyId(id);
    try {
      await mediaApi.remove(id);
      await load(siteId || undefined);
      setTimeout(() => {
        processQueue().catch(() => undefined);
      }, 50);
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
        `Remove ${ids.length} selected image(s) from SheetPress only? Next queued batch will upload.`,
      )
    )
      return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await mediaApi.removeMany(ids);
      setMessage(
        `Removed ${res.data.deleted} from SheetPress. Starting next queue batch…`,
      );
      await load(siteId || undefined);
      setTimeout(() => {
        processQueue().catch(() => undefined);
      }, 50);
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
        `Remove ALL ${items.length} listed image(s) from SheetPress only? Next queued batch will upload.`,
      )
    )
      return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await mediaApi.removeMany(items.map((i) => i.id));
      setMessage(
        `Removed ${res.data.deleted} from SheetPress. Processing upload queue…`,
      );
      await load(siteId || undefined);
      setTimeout(() => {
        processQueue().catch(() => undefined);
      }, 50);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete all failed");
    } finally {
      setLoading(false);
    }
  }

  function clearFinishedQueue() {
    setQueue((prev) => {
      const next = prev.filter(
        (q) => q.status === "queued" || q.status === "uploading",
      );
      queueRef.current = next;
      return next;
    });
  }

  function clearEntireQueue() {
    if (processing) {
      setError("Wait for the current batch to finish before clearing the queue.");
      return;
    }
    queueRef.current = [];
    setQueue([]);
    setMessage("Upload queue cleared.");
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

  const activeQueue = queue.filter((q) => q.status !== "done");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="mt-1 text-sm text-muted">
          Library: <strong>{quota.used}/{quota.limit}</strong> · WebP · under
          100KB · queue uploads in waves of <strong>{BATCH_SIZE}</strong>.
          Delete from SheetPress to free slots and auto-start the next batch.
          WordPress files stay when you delete here.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">How the upload queue works</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Select any number of WebP files — all go into the queue.</li>
          <li>
            SheetPress uploads up to <strong>{BATCH_SIZE}</strong> while library
            slots are free.
          </li>
          <li>
            Remaining stay <strong>Queued</strong>. After you delete images from
            SheetPress, the next {BATCH_SIZE} start automatically.
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
              disabled={loading || processing || quota.used >= quota.limit}
              onClick={uploadUrl}
            >
              {loading ? "Uploading…" : "Upload URL to WordPress"}
            </Button>
          </div>
          <div className="space-y-3">
            <Input
              label={`Add WebP files to queue (${BATCH_SIZE}/wave, 100KB each)`}
              type="file"
              accept="image/webp,.webp"
              multiple
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                enqueueSelectedFiles(list);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={processing || !queueCounts.queued || !siteId}
                onClick={() => processQueue()}
              >
                {processing
                  ? "Uploading batch…"
                  : `Continue queue (${queueCounts.queued} waiting)`}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={processing}
                onClick={clearFinishedQueue}
              >
                Clear finished
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={processing || queue.length === 0}
                onClick={clearEntireQueue}
              >
                Clear queue
              </Button>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-brand">{message}</p> : null}
      </Card>

      {queue.length > 0 ? (
        <Card className="space-y-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Upload queue</h2>
            <p className="text-sm text-muted">
              Waiting {queueCounts.queued} · Uploading {queueCounts.uploading} ·
              Done {queueCounts.done} · Failed {queueCounts.failed}
            </p>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {activeQueue.length === 0 ? (
              <p className="text-sm text-muted">
                All selected files finished. Clear finished to tidy the list.
              </p>
            ) : (
              activeQueue.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{q.file.name}</p>
                    <p className="text-xs text-muted">
                      {formatSize(q.file.size)}
                      {q.error ? ` · ${q.error}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={queueBadge(q.status)} />
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

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
              No media in SheetPress library yet. Add files to the queue above.
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
