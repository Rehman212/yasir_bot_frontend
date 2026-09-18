"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  ApiError,
  queueApi,
  sitesApi,
  type QueueRow,
  type WpSite,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const SECTIONS: { key: string; statuses: string[]; label: string }[] = [
  { key: "Waiting", statuses: ["WAITING"], label: "Waiting / Queue" },
  { key: "Scheduled", statuses: ["DELAYED", "PAUSED"], label: "Scheduled" },
  { key: "Processing", statuses: ["ACTIVE"], label: "Processing" },
  { key: "Completed", statuses: ["COMPLETED"], label: "Completed" },
  { key: "Failed", statuses: ["FAILED"], label: "Failed" },
  { key: "Cancelled", statuses: ["CANCELLED"], label: "Cancelled" },
];

function formatWhen(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: string) {
  switch (status) {
    case "WAITING":
      return "Queued";
    case "DELAYED":
      return "Scheduled";
    case "ACTIVE":
      return "Processing";
    case "PAUSED":
      return "Paused";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<QueueRow[]>([]);
  const [sites, setSites] = useState<WpSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [titlesText, setTitlesText] = useState("");
  const [siteId, setSiteId] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("0");

  const load = useCallback(async () => {
    setError("");
    try {
      const [q, s] = await Promise.all([queueApi.list(), sitesApi.list()]);
      setJobs(q.data || []);
      setSites(s.data || []);
      if (!siteId && s.data?.[0]?.id) setSiteId(s.data[0].id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15_000);
    return () => clearInterval(t);
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<string, QueueRow[]> = {};
    for (const section of SECTIONS) map[section.key] = [];
    for (const job of jobs) {
      const section =
        SECTIONS.find((s) => s.statuses.includes(job.status)) ||
        SECTIONS[0];
      map[section.key].push(job);
    }
    return map;
  }, [jobs]);

  async function pauseAll() {
    setBusy(true);
    try {
      await queueApi.pause();
      setMessage("Queue paused");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Pause failed");
    } finally {
      setBusy(false);
    }
  }

  async function resumeAll() {
    setBusy(true);
    try {
      await queueApi.resume();
      setMessage("Queue resumed");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Resume failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRetry(id: string) {
    try {
      await queueApi.retry(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Retry failed");
    }
  }

  async function onCancel(id: string) {
    try {
      await queueApi.cancel(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cancel failed");
    }
  }

  async function submitEnqueue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const titles = titlesText
      .split(/\r?\n/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!siteId) {
      setError("Select a website");
      return;
    }
    if (titles.length === 0) {
      setError("Paste at least one article title (one per line)");
      return;
    }
    if (!publishAt) {
      setError("Select a publish date & time");
      return;
    }

    setBusy(true);
    try {
      const scheduledAt = new Date(publishAt).toISOString();
      const res = await queueApi.enqueueByTitles({
        siteId,
        titles,
        scheduledAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        intervalMinutes: Math.max(0, parseInt(intervalMinutes || "0", 10) || 0),
        createMissing: true,
      });

      const missing = res.data.resolved.filter((r) => r.error);
      const created = res.data.resolved.filter((r) => r.created).length;
      const queued = res.data.jobs.length;

      setMessage(
        `${queued} job(s) scheduled for ${formatWhen(res.data.scheduledAt) || publishAt}` +
          (created ? ` · ${created} new draft(s) created` : "") +
          (missing.length ? ` · ${missing.length} skipped` : ""),
      );
      setModalOpen(false);
      setTitlesText("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add to queue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
            Publishing Queue
          </h1>
          <p className="mt-1 text-sm text-muted">
            Add articles by title, schedule a date, and auto-publish when due.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add article to queue
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={busy}
            onClick={() => void pauseAll()}
          >
            Pause queue
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void resumeAll()}
          >
            Resume queue
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading queue…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {SECTIONS.map((section) => {
            const items = grouped[section.key] || [];
            return (
              <Card key={section.key} className="p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{section.label}</h2>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted">No jobs in this section.</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item) => {
                      const when =
                        formatWhen(item.scheduledAt) ||
                        formatWhen(item.article?.publishAt);
                      return (
                        <li
                          key={item.id}
                          className="rounded-xl border border-border bg-surface-muted/80 px-3 py-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {item.article?.title || "Untitled article"}
                              </p>
                              <p className="mt-0.5 text-muted">
                                {item.site?.name || "Unknown site"}
                              </p>
                            </div>
                            <StatusBadge status={statusLabel(item.status)} />
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                            <span
                              className={cn(
                                "font-medium",
                                item.status === "DELAYED" ||
                                  item.status === "WAITING"
                                  ? "text-brand"
                                  : "",
                              )}
                            >
                              Status: {statusLabel(item.status)}
                            </span>
                            {when ? (
                              <span>
                                {item.status === "DELAYED" ||
                                item.status === "WAITING"
                                  ? "Scheduled for "
                                  : "Target "}
                                <strong className="text-foreground">{when}</strong>
                              </span>
                            ) : null}
                            {item.error ? (
                              <span className="text-danger">{item.error}</span>
                            ) : null}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.error ? (
                              <Button size="sm" variant="ghost" type="button" disabled>
                                View error
                              </Button>
                            ) : null}
                            {(item.status === "FAILED" ||
                              item.status === "CANCELLED") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                onClick={() => void onRetry(item.id)}
                              >
                                Retry
                              </Button>
                            )}
                            {["WAITING", "DELAYED", "PAUSED", "ACTIVE"].includes(
                              item.status,
                            ) ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                onClick={() => void onCancel(item.id)}
                              >
                                Cancel
                              </Button>
                            ) : null}
                            {item.article?.wpUrl ? (
                              <a
                                href={item.article.wpUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-brand hover:underline"
                              >
                                View post
                              </a>
                            ) : item.articleId ? (
                              <Link
                                href={`/articles/${item.articleId}`}
                                className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-brand hover:underline"
                              >
                                Open article
                              </Link>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold tracking-tight">
                  Add article to queue
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Paste titles (one per line), pick a website and publish date.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitEnqueue}>
              <Textarea
                label="Article titles"
                placeholder={"Complete SEO Guide for 2026\nRank Math Setup Checklist\n…"}
                value={titlesText}
                onChange={(e) => setTitlesText(e.target.value)}
                className="min-h-36"
                required
              />
              <p className="-mt-2 text-xs text-muted">
                Matches existing articles on the site (case-insensitive). Missing
                titles create drafts automatically.
              </p>

              <Select
                label="Website"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select website
                </option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Publish date & time"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                required
              />

              <Input
                label="Stagger interval (minutes)"
                type="number"
                min={0}
                hint="0 = all at the same time. e.g. 5 = each next article +5 min"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
              />

              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Scheduling…" : "Add to queue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
