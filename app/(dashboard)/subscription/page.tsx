"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Download,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import {
  ApiError,
  subscriptionsApi,
  type BillingRow,
  type SubscriptionStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const PLAN_COPY: Record<
  string,
  { title: string; blurb: string; priceLabel: string }
> = {
  FREE: {
    title: "Free",
    blurb: "Try the workflow on a single site.",
    priceLabel: "$0 / mo",
  },
  STARTER: {
    title: "Starter",
    blurb: "For solo creators publishing regularly.",
    priceLabel: "$19 / mo",
  },
  PROFESSIONAL: {
    title: "Professional",
    blurb: "For serious content teams and freelancers.",
    priceLabel: "$49 / mo",
  },
  AGENCY: {
    title: "Agency",
    blurb: "For agencies managing many client sites.",
    priceLabel: "$149 / mo",
  },
};

function UsageBar({
  label,
  used,
  limit,
  suffix = "",
}: {
  label: string;
  used: number;
  limit: number;
  suffix?: string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const danger = pct >= 90;
  const warn = pct >= 70 && !danger;
  return (
    <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">
          {used.toLocaleString()}
          <span className="font-normal text-muted">
            {" "}
            / {limit.toLocaleString()}
            {suffix}
          </span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            danger ? "bg-danger" : warn ? "bg-warning" : "bg-brand",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{pct}% used</p>
    </div>
  );
}

export default function SubscriptionPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [billing, setBilling] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [s, b] = await Promise.all([
        subscriptionsApi.status(),
        subscriptionsApi.billing().catch(() => ({ data: [] as BillingRow[] })),
      ]);
      setStatus(s.data);
      setBilling(b.data || []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load subscription",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const planKey = (status?.plan || "FREE").toUpperCase();
  const copy = PLAN_COPY[planKey] || {
    title: planKey,
    blurb: "Your current SheetPress plan.",
    priceLabel: "—",
  };

  const renews = useMemo(() => {
    if (!status?.periodEnd) return null;
    const d = new Date(status.periodEnd);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [status?.periodEnd]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
            Subscription
          </h1>
          <p className="mt-1 text-sm text-muted">
            Plan limits, usage, upgrades, and billing — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/pricing" variant="secondary">
            Compare plans
          </Button>
          <Button href="/pricing">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Upgrade
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading subscription…</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-[var(--sidebar)] via-[#0f1729] to-[#087990] px-6 py-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Current plan
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">
                    {copy.title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-slate-300">
                    {copy.blurb}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/15 backdrop-blur">
                  <p className="text-xs text-slate-300">Price</p>
                  <p className="mt-1 text-xl font-semibold">{copy.priceLabel}</p>
                  <Badge
                    tone={status?.status === "ACTIVE" ? "success" : "warning"}
                    className="mt-2"
                  >
                    {status?.status || "UNKNOWN"}
                  </Badge>
                </div>
              </div>
              {renews ? (
                <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Current period ends {renews}
                </p>
              ) : null}
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <UsageBar
                  label="Monthly articles"
                  used={status?.usage.articlesUsed ?? 0}
                  limit={status?.usage.articleLimit ?? 0}
                />
                <UsageBar
                  label="Connected websites"
                  used={status?.usage.websitesUsed ?? 0}
                  limit={status?.usage.websiteLimit ?? 0}
                />
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                <Button href="/pricing">Upgrade or downgrade</Button>
                <Button variant="secondary" type="button" disabled>
                  <Download className="mr-1.5 h-4 w-4" />
                  Download invoice
                </Button>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-semibold">Billing history</h2>
                <p className="text-xs text-muted">Recent charges on this account</p>
              </div>
            </div>

            {billing.length === 0 ? (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  No invoices yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  Paid plan changes will appear here automatically.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {billing.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-muted/60 px-3 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {new Date(row.paidAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {row.description || "Subscription charge"}
                      </p>
                      <Badge tone="success" className="mt-1.5">
                        Paid
                      </Badge>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {row.currency === "USD" ? "$" : `${row.currency} `}
                      {Number(row.amount).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
