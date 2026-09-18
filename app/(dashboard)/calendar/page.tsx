"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import {
  ApiError,
  queueApi,
  sitesApi,
  type QueueRow,
  type WpSite,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type CalEvent = {
  id: string;
  articleId: string;
  title: string;
  siteName: string;
  platform: string;
  status: string;
  statusLabel: string;
  at: Date;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function statusTone(status: string) {
  switch (status) {
    case "WAITING":
      return "bg-accent text-white";
    case "DELAYED":
    case "PAUSED":
      return "bg-brand text-white";
    case "ACTIVE":
      return "bg-[#0b3d91] text-white";
    case "COMPLETED":
      return "bg-success text-white";
    case "FAILED":
      return "bg-danger text-white";
    case "CANCELLED":
      return "bg-slate-400 text-white";
    default:
      return "bg-brand text-white";
  }
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Monday=0 … Sunday=6 for grid alignment */
function mondayOffset(d: Date) {
  const day = startOfMonth(d).getDay(); // Sun=0
  return day === 0 ? 6 : day - 1;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function platformName(p?: string | null) {
  return p === "SHOPIFY" ? "Shopify" : "WordPress";
}

export default function CalendarPage() {
  const [view, setView] = useState<"Monthly" | "Weekly" | "Daily">("Monthly");
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [siteId, setSiteId] = useState("all");
  const [sites, setSites] = useState<WpSite[]>([]);
  const [jobs, setJobs] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [q, s] = await Promise.all([queueApi.list(), sitesApi.list()]);
      setJobs(q.data || []);
      setSites(s.data || []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load calendar",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 20_000);
    return () => clearInterval(t);
  }, [load]);

  const events = useMemo(() => {
    const list: CalEvent[] = [];
    for (const job of jobs) {
      if (siteId !== "all" && job.siteId !== siteId) continue;
      const raw = job.scheduledAt || job.article?.publishAt;
      if (!raw) continue;
      const at = new Date(raw);
      if (isNaN(at.getTime())) continue;

      const site = sites.find((s) => s.id === job.siteId);
      list.push({
        id: job.id,
        articleId: job.articleId,
        title: job.article?.title || "Untitled",
        siteName: job.site?.name || site?.name || "Unknown site",
        platform: platformName(site?.platform),
        status: job.status,
        statusLabel: statusLabel(job.status),
        at,
      });
    }
    return list.sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [jobs, siteId, sites]);

  const monthEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.at.getFullYear() === cursor.getFullYear() &&
          e.at.getMonth() === cursor.getMonth(),
      ),
    [events, cursor],
  );

  const cells = useMemo(() => {
    const total = daysInMonth(cursor);
    const offset = mondayOffset(cursor);
    const out: Array<{ day: number | null; date: Date | null }> = [];
    for (let i = 0; i < offset; i++) out.push({ day: null, date: null });
    for (let d = 1; d <= total; d++) {
      out.push({
        day: d,
        date: new Date(cursor.getFullYear(), cursor.getMonth(), d),
      });
    }
    while (out.length % 7 !== 0) out.push({ day: null, date: null });
    return out;
  }, [cursor]);

  const weekStart = useMemo(() => {
    const today =
      view === "Weekly"
        ? new Date()
        : new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const day = today.getDay();
    const mondayDiff = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + mondayDiff);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [view, cursor]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const dayFocus = useMemo(() => new Date(), []);

  const monthLabel = cursor.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  function eventsOn(day: Date) {
    return events.filter((e) => sameDay(e.at, day));
  }

  function EventChip({ event }: { event: CalEvent }) {
    return (
      <button
        type="button"
        onClick={() => setSelected(event)}
        className={cn(
          "w-full rounded-lg px-2 py-1 text-left text-[11px] font-medium shadow-sm transition hover:opacity-90",
          statusTone(event.status),
        )}
        title={`${event.title} · ${event.statusLabel} · ${event.siteName} (${event.platform}) · ${formatTime(event.at)}`}
      >
        <span className="line-clamp-1">{event.title}</span>
        <span className="mt-0.5 block truncate text-[10px] opacity-90">
          {event.statusLabel} · {formatTime(event.at)} · {event.platform}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Live view of queued and scheduled publish jobs by date.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["Monthly", "Weekly", "Daily"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold",
                view === mode
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-muted",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Filter by website"
              className="max-w-xs"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="all">All websites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {platformName(s.platform)}
                </option>
              ))}
            </Select>
            {view === "Monthly" ? (
              <div className="flex items-center gap-2 pb-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                    )
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="min-w-[10rem] text-center text-sm font-semibold">
                  {monthLabel}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                    )
                  }
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="self-end pb-2 text-sm text-muted">
                {monthEvents.length} job(s) this month · queue + scheduled
              </p>
            )}
          </div>
          <p className="text-xs text-muted">
            {loading ? "Loading…" : `${events.length} job(s) shown`}
          </p>
        </div>

        {view === "Monthly" ? (
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-1 text-xs font-semibold text-muted"
              >
                {d}
              </div>
            ))}
            {cells.map((cell, idx) => {
              if (!cell.date || cell.day == null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-24 rounded-xl border border-transparent bg-transparent"
                  />
                );
              }
              const dayEvents = eventsOn(cell.date);
              const isToday = sameDay(cell.date, new Date());
              return (
                <div
                  key={cell.date.toISOString()}
                  className={cn(
                    "min-h-28 rounded-xl border border-border bg-surface-muted/80 p-2",
                    isToday && "ring-2 ring-accent/40",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "text-brand" : "text-muted",
                    )}
                  >
                    {cell.day}
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <EventChip key={ev.id} event={ev} />
                    ))}
                    {dayEvents.length > 3 ? (
                      <p className="px-1 text-[10px] font-medium text-muted">
                        +{dayEvents.length - 3} more
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : view === "Weekly" ? (
          <div className="space-y-3">
            {weekDays.map((day) => {
              const dayEvents = eventsOn(day);
              return (
                <div
                  key={day.toISOString()}
                  className="rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {day.toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <span className="text-xs text-muted">
                      {dayEvents.length} job(s)
                    </span>
                  </div>
                  {dayEvents.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">No jobs this day.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {dayEvents.map((ev) => (
                        <li
                          key={ev.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface-muted/60 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium">{ev.title}</p>
                            <p className="text-xs text-muted">
                              {ev.statusLabel} · {formatTime(ev.at)} ·{" "}
                              {ev.siteName} ({ev.platform})
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            type="button"
                            onClick={() => setSelected(ev)}
                          >
                            Details
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold">
              {dayFocus.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {eventsOn(dayFocus).length === 0 ? (
              <p className="text-sm text-muted">No jobs scheduled for today.</p>
            ) : (
              eventsOn(dayFocus).map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{ev.title}</p>
                    <p className="text-sm text-muted">
                      {ev.statusLabel} · {formatTime(ev.at)} · {ev.siteName} (
                      {ev.platform})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setSelected(ev)}
                  >
                    Open details
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
              {selected.title}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd className="font-medium">{selected.statusLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">When</dt>
                <dd className="font-medium">
                  {selected.at.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Website</dt>
                <dd className="font-medium text-right">
                  {selected.siteName}
                  <span className="block text-xs text-muted">
                    {selected.platform}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </Button>
              <Button href={`/articles/${selected.articleId}`} type="button">
                Open article
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
