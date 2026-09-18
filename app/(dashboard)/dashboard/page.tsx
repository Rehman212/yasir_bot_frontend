"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  FileText,
  Globe2,
  Import,
  ListOrdered,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { DownloadSampleSheetButton } from "@/components/download-sample-sheet-button";
import { dashboardApi, type DashboardStats, getAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statMeta: Record<
  string,
  { icon: typeof Globe2; tone: string; hint: string }
> = {
  "Connected websites": {
    icon: Globe2,
    tone: "from-brand/15 to-brand/5 text-brand",
    hint: "Live WP connections",
  },
  "Imported articles": {
    icon: FileText,
    tone: "from-accent/20 to-accent/5 text-[#0891b2]",
    hint: "In your library",
  },
  Published: {
    icon: TrendingUp,
    tone: "from-success/20 to-success/5 text-success",
    hint: "Successfully live",
  },
  Scheduled: {
    icon: CalendarDays,
    tone: "from-brand/15 to-accent/10 text-brand",
    hint: "Waiting to go live",
  },
  Failed: {
    icon: XCircle,
    tone: "from-danger/15 to-danger/5 text-danger",
    hint: "Needs a retry",
  },
  "Monthly usage": {
    icon: ListOrdered,
    tone: "from-warning/20 to-warning/5 text-warning",
    hint: "Plan quota",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    dashboardApi
      .stats()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Failed to load dashboard"));
  }, [router]);

  const stats = data?.stats ?? [];
  const displayStats = stats.length
    ? stats
    : [
        "Connected websites",
        "Imported articles",
        "Published",
        "Scheduled",
        "Failed",
        "Monthly usage",
      ].map((label) => ({ label, value: "…" }));

  return (
    <div className="space-y-7">
      {/* Command header */}
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-[#070d1a] via-[#0b1a33] to-[#0a3a4a] p-6 text-white shadow-[var(--shadow-md)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-brand/40 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl animate-fade-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Publishing control center
            </div>
            <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight sm:text-3xl">
              Overview
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              Sites, imports, and queue health — everything that keeps your
              WordPress pipeline moving.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2 animate-fade-up delay-100">
            <DownloadSampleSheetButton
              variant="secondary"
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
            />
            <Button
              href="/import"
              className="bg-accent text-[#042f2e] hover:bg-cyan-300 shadow-lg shadow-cyan-500/25"
            >
              <Import className="h-4 w-4" />
              Quick Import
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayStats.map((stat, i) => {
          const meta = statMeta[stat.label] || {
            icon: FileText,
            tone: "from-brand/10 to-accent/5 text-brand",
            hint: "Metric",
          };
          const Icon = meta.icon;
          return (
            <Card
              key={stat.label}
              className={cn(
                "stat-card-glow border-border/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] animate-fade-up",
                i === 1 && "delay-100",
                i === 2 && "delay-200",
                i === 3 && "delay-100",
                i === 4 && "delay-200",
                i === 5 && "delay-300",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted">{meta.hint}</p>
                </div>
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                    meta.tone,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Panels */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden border-border/80 p-0 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-muted/60 px-5 py-4">
            <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-tight">
              Recent imports
            </h2>
            <Link
              href="/import"
              className="text-xs font-semibold text-brand hover:text-brand-hover"
            >
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-border/60 px-2 py-2">
            {(data?.recentImports?.length
              ? data.recentImports
              : [{ id: "empty", label: "No imports yet", status: "Draft" }]
            ).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-surface-muted"
              >
                <span className="font-medium text-foreground">{item.label}</span>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden border-border/80 p-0">
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-muted/60 px-5 py-4">
            <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-tight">
              Upcoming scheduled
            </h2>
            <Link
              href="/calendar"
              className="text-xs font-semibold text-brand hover:text-brand-hover"
            >
              Calendar →
            </Link>
          </div>
          <ul className="divide-y divide-border/60 px-2 py-2">
            {(data?.upcoming?.length
              ? data.upcoming
              : [
                  {
                    id: "empty",
                    title: "Nothing scheduled",
                    publishDate: null,
                    website: "—",
                  },
                ]
            ).map((article) => (
              <li
                key={article.id}
                className="rounded-xl px-3 py-3 text-sm transition hover:bg-surface-muted"
              >
                <p className="font-medium text-foreground">{article.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {article.publishDate
                    ? new Date(article.publishDate).toLocaleString()
                    : "—"}{" "}
                  · {article.website}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden border-border/80 p-0">
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-muted/60 px-5 py-4">
            <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-tight">
              Recent activity
            </h2>
            <Link
              href="/activity"
              className="text-xs font-semibold text-brand hover:text-brand-hover"
            >
              Logs →
            </Link>
          </div>
          <ul className="space-y-1 px-2 py-2">
            {(data?.recentActivity?.length
              ? data.recentActivity
              : [
                  {
                    id: "empty",
                    event: "No activity yet",
                    detail: "Actions will appear here",
                    time: "",
                  },
                ]
            ).map((log) => (
              <li
                key={log.id}
                className="rounded-xl px-3 py-3 text-sm transition hover:bg-surface-muted"
              >
                <div className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="font-medium text-foreground">{log.event}</p>
                    <p className="text-xs text-muted">
                      {log.detail}
                      {log.time
                        ? ` · ${new Date(log.time).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="relative overflow-hidden border-warning/25 bg-gradient-to-br from-warning-soft via-white to-accent-soft/40 p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-warning/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning ring-1 ring-warning/20">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-tight text-foreground">
                Failed articles needing attention
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                <span className="font-semibold text-foreground">
                  {data?.failedCount ?? 0}
                </span>{" "}
                posts failed during media upload or connection timeouts.
              </p>
              <Button href="/queue" variant="secondary" size="sm" className="mt-4">
                Review queue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
