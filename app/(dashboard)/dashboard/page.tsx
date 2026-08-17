"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { DownloadSampleSheetButton } from "@/components/download-sample-sheet-button";
import { dashboardApi, type DashboardStats, getAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Connected sites, imports, and publishing health at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DownloadSampleSheetButton variant="secondary" />
          <Button href="/import">
            <Import className="h-4 w-4" />
            Quick Import
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(stats.length
          ? stats
          : [
              "Connected websites",
              "Imported articles",
              "Published",
              "Scheduled",
              "Failed",
              "Monthly usage",
            ].map((label) => ({ label, value: "…" }))
        ).map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold text-foreground">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent imports</h2>
            <Link href="/import" className="text-sm font-medium text-brand">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(data?.recentImports?.length
              ? data.recentImports
              : [{ id: "empty", label: "No imports yet", status: "Draft" }]
            ).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-3 text-sm"
              >
                <span>{item.label}</span>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Upcoming scheduled</h2>
            <Link href="/calendar" className="text-sm font-medium text-brand">
              Calendar
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
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
                className="rounded-xl bg-surface-muted px-3 py-3 text-sm"
              >
                <p className="font-medium text-foreground">{article.title}</p>
                <p className="mt-1 text-muted">
                  {article.publishDate
                    ? new Date(article.publishDate).toLocaleString()
                    : "—"}{" "}
                  · {article.website}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent activity</h2>
            <Link href="/activity" className="text-sm font-medium text-brand">
              Logs
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
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
              <li key={log.id} className="text-sm">
                <p className="font-medium text-foreground">{log.event}</p>
                <p className="text-muted">
                  {log.detail}
                  {log.time
                    ? ` · ${new Date(log.time).toLocaleString()}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-warning/30 bg-warning-soft p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">
                Failed articles needing attention
              </h2>
              <p className="mt-1 text-sm text-muted">
                {data?.failedCount ?? 0} posts failed during media upload or
                connection timeouts.
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
