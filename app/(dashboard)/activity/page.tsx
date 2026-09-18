"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Globe2,
  Link2Off,
  LogIn,
  LogOut,
  Pencil,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge, Card } from "@/components/ui/primitives";
import {
  ApiError,
  auditLogsApi,
  notificationsApi,
  queueApi,
  type AuditLogRow,
  type NotificationRow,
  type QueueRow,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type FeedItem = {
  id: string;
  source: "audit" | "notification" | "queue";
  title: string;
  detail: string;
  action: string;
  entity: string;
  when: Date;
  tone: "neutral" | "success" | "warning" | "danger" | "brand" | "accent";
  meta?: Record<string, unknown> | null;
  userLabel?: string;
};

const FEED_PAGE_SIZE = 10;

const ACTION_FILTERS = [
  { value: "all", label: "All events" },
  { value: "IMPORT", label: "Imports" },
  { value: "PUBLISH", label: "Publishing" },
  { value: "CREATE", label: "Creates" },
  { value: "UPDATE", label: "Updates" },
  { value: "DELETE", label: "Deletes" },
  { value: "LOGIN", label: "Auth" },
  { value: "CONNECT", label: "Connections" },
  { value: "QUEUE", label: "Queue jobs" },
  { value: "NOTIFY", label: "Notifications" },
] as const;

function relativeTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${Math.max(0, sec)}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day} day${day === 1 ? "" : "s"} ago`;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function actionTone(action: string): FeedItem["tone"] {
  switch (action) {
    case "PUBLISH":
    case "IMPORT":
    case "CONNECT":
    case "CREATE":
    case "COMPLETED":
      return "success";
    case "FAILED":
    case "DELETE":
    case "DISCONNECT":
    case "CANCELLED":
      return "danger";
    case "UPDATE":
    case "LOGIN":
    case "WAITING":
    case "DELAYED":
    case "ACTIVE":
      return "brand";
    case "ADMIN":
      return "accent";
    default:
      return "neutral";
  }
}

function ActionIcon({ action, className }: { action: string; className?: string }) {
  const props = { className: cn("h-4 w-4", className) };
  switch (action) {
    case "IMPORT":
      return <FileUp {...props} />;
    case "PUBLISH":
    case "COMPLETED":
      return <CheckCircle2 {...props} />;
    case "FAILED":
      return <XCircle {...props} />;
    case "CREATE":
      return <Upload {...props} />;
    case "UPDATE":
      return <Pencil {...props} />;
    case "DELETE":
    case "CANCELLED":
      return <Trash2 {...props} />;
    case "LOGIN":
      return <LogIn {...props} />;
    case "LOGOUT":
      return <LogOut {...props} />;
    case "CONNECT":
      return <Globe2 {...props} />;
    case "DISCONNECT":
      return <Link2Off {...props} />;
    case "ADMIN":
      return <Shield {...props} />;
    case "WAITING":
    case "DELAYED":
    case "ACTIVE":
      return <Activity {...props} />;
    default:
      return <AlertTriangle {...props} />;
  }
}

function titleForAudit(log: AuditLogRow) {
  const entity = log.entity || "Item";
  switch (log.action) {
    case "IMPORT":
      return "Import completed";
    case "PUBLISH":
      return "Publish event";
    case "CREATE":
      return `${entity} created`;
    case "UPDATE":
      return `${entity} updated`;
    case "DELETE":
      return `${entity} deleted`;
    case "LOGIN":
      return "User signed in";
    case "LOGOUT":
      return "User signed out";
    case "CONNECT":
      return "Website connected";
    case "DISCONNECT":
      return "Website disconnected";
    case "ADMIN":
      return "Admin action";
    default:
      return `${log.action} · ${entity}`;
  }
}

function detailForAudit(log: AuditLogRow) {
  const meta = (log.metadata || {}) as Record<string, unknown>;
  const bits: string[] = [];
  if (meta.filename) bits.push(String(meta.filename));
  if (meta.imported != null) bits.push(`${meta.imported} imported`);
  if (meta.errors != null) bits.push(`${meta.errors} errors`);
  if (meta.siteId) bits.push(`site ${String(meta.siteId).slice(0, 8)}…`);
  if (meta.title) bits.push(String(meta.title));
  if (meta.message) bits.push(String(meta.message));
  if (log.entityId) bits.push(`id ${log.entityId.slice(0, 10)}…`);
  if (log.ip) bits.push(`ip ${log.ip}`);
  if (bits.length) return bits.join(" · ");
  return `${log.action} on ${log.entity}`;
}

function fromAudit(log: AuditLogRow): FeedItem {
  return {
    id: `audit-${log.id}`,
    source: "audit",
    title: titleForAudit(log),
    detail: detailForAudit(log),
    action: log.action,
    entity: log.entity,
    when: new Date(log.createdAt),
    tone: actionTone(log.action),
    meta: log.metadata,
    userLabel: log.user?.name || log.user?.email || undefined,
  };
}

function fromNotification(n: NotificationRow): FeedItem {
  const type = (n.type || "NOTIFY").toUpperCase();
  const failed = /fail|error/i.test(n.title + n.message);
  return {
    id: `notify-${n.id}`,
    source: "notification",
    title: n.title,
    detail: n.message,
    action: failed ? "FAILED" : "NOTIFY",
    entity: type,
    when: new Date(n.createdAt),
    tone: failed ? "danger" : "accent",
    meta: n.meta,
  };
}

function fromQueue(job: QueueRow): FeedItem {
  const status = job.status;
  return {
    id: `queue-${job.id}`,
    source: "queue",
    title: `Queue · ${status}`,
    detail: [
      job.article?.title || "Untitled article",
      job.site?.name,
      job.error,
      job.scheduledAt
        ? `for ${new Date(job.scheduledAt).toLocaleString()}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    action: status,
    entity: "PublishJob",
    when: new Date(job.createdAt || job.scheduledAt || Date.now()),
    tone: actionTone(status),
    meta: {
      articleId: job.articleId,
      siteId: job.siteId,
      progress: job.progress,
    },
  };
}

const toneBg: Record<FeedItem["tone"], string> = {
  neutral: "bg-surface-muted text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent",
};

export default function ActivityPage() {
  const [audits, setAudits] = useState<AuditLogRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [jobs, setJobs] = useState<QueueRow[]>([]);
  const [feedPage, setFeedPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, n, q] = await Promise.all([
        auditLogsApi.list({ page: "1", limit: "100" }),
        notificationsApi.list().catch(() => ({ data: [] as NotificationRow[] })),
        queueApi.list().catch(() => ({ data: [] as QueueRow[] })),
      ]);
      setAudits(a.data || []);
      setNotifications(n.data || []);
      setJobs(q.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    setFeedPage(1);
    setExpanded(null);
  }, [filter, search]);

  const feed = useMemo(() => {
    const items: FeedItem[] = [
      ...audits.map(fromAudit),
      ...notifications.map(fromNotification),
      ...jobs.map(fromQueue),
    ].sort((a, b) => b.when.getTime() - a.when.getTime());

    return items.filter((item) => {
      if (filter === "all") {
        /* keep */
      } else if (filter === "QUEUE") {
        if (item.source !== "queue") return false;
      } else if (filter === "NOTIFY") {
        if (item.source !== "notification") return false;
      } else if (filter === "LOGIN") {
        if (!["LOGIN", "LOGOUT"].includes(item.action)) return false;
      } else if (item.action !== filter && item.entity !== filter) {
        return false;
      }

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.entity.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q)
      );
    });
  }, [audits, notifications, jobs, filter, search]);

  const totalPages = Math.max(1, Math.ceil(feed.length / FEED_PAGE_SIZE));
  const currentPage = Math.min(feedPage, totalPages);
  const pageStart = (currentPage - 1) * FEED_PAGE_SIZE;
  const pageItems = feed.slice(pageStart, pageStart + FEED_PAGE_SIZE);
  const counts = useMemo(() => {
    const all = [
      ...audits.map(fromAudit),
      ...notifications.map(fromNotification),
      ...jobs.map(fromQueue),
    ];
    return {
      total: all.length,
      failed: all.filter((i) => i.tone === "danger").length,
      publish: all.filter((i) =>
        ["PUBLISH", "COMPLETED", "DELAYED", "WAITING", "ACTIVE"].includes(
          i.action,
        ),
      ).length,
      imports: all.filter((i) => i.action === "IMPORT").length,
    };
  }, [audits, notifications, jobs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
            Activity Logs
          </h1>
          <p className="mt-1 text-sm text-muted">
            Every import, publish, queue job, connection, and system event — one
            timeline.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setLoading(true);
            void load();
          }}
        >
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Events loaded", value: counts.total, tone: "brand" as const },
          { label: "Imports", value: counts.imports, tone: "success" as const },
          { label: "Publish / queue", value: counts.publish, tone: "accent" as const },
          { label: "Failures / cancels", value: counts.failed, tone: "danger" as const },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {s.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-2xl font-semibold">
              {s.value}
            </p>
            <Badge tone={s.tone} className="mt-2">
              Live
            </Badge>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <Input
              label="Search logs"
              placeholder="Search title, detail, entity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Filter"
            className="max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {ACTION_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading activity…</p>
        ) : feed.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No activity yet. Imports, publishes, and queue jobs will show up here.
          </p>
        ) : (
          <ol className="relative mt-6 space-y-0 border-l border-border/80 pl-0">
            {pageItems.map((item) => {
              const open = expanded === item.id;
              return (
                <li key={item.id} className="relative pl-10">
                  <span
                    className={cn(
                      "absolute left-0 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-white",
                      toneBg[item.tone],
                    )}
                  >
                    <ActionIcon action={item.action} />
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : item.id)}
                    className="mb-3 w-full rounded-2xl border border-border/80 bg-white px-4 py-3 text-left shadow-sm transition hover:border-brand/30 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {item.title}
                          </p>
                          <Badge
                            tone={
                              item.tone === "neutral" ? "neutral" : item.tone
                            }
                          >
                            {item.action}
                          </Badge>
                          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                            {item.source}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{item.detail}</p>
                        {item.userLabel ? (
                          <p className="mt-1 text-xs text-muted">
                            by {item.userLabel}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-muted">
                          {relativeTime(item.when)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {item.when.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {open && item.meta ? (
                      <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-surface-muted p-3 text-[11px] leading-relaxed text-muted">
                        {JSON.stringify(item.meta, null, 2)}
                      </pre>
                    ) : null}
                    <p className="mt-2 text-[11px] font-medium text-brand">
                      {open ? "Hide details" : "Show details"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {feed.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted">
              {pageStart + 1}–{Math.min(pageStart + FEED_PAGE_SIZE, feed.length)}{" "}
              of {feed.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => {
                  setExpanded(null);
                  setFeedPage((p) => Math.max(1, p - 1));
                }}
              >
                Prev
              </Button>
              <span className="min-w-[4.5rem] text-center text-xs font-semibold text-muted">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setExpanded(null);
                  setFeedPage((p) => Math.min(totalPages, p + 1));
                }}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
