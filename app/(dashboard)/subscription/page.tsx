import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { pricingPlans } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Subscription" };

export default function SubscriptionPage() {
  const current = pricingPlans.find((p) => p.name === "Professional")!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Subscription
        </h1>
        <p className="mt-1 text-sm text-muted">
          Track plan limits, usage, upgrades, and billing history.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Current plan
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold">
            {current.name}
          </h2>
          <p className="mt-2 text-sm text-muted">{current.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Monthly article usage", "86 / 1,000"],
              ["Connected website limit", "4 / 10"],
              ["Team members", "2 / 5"],
              ["Storage", "3.2 GB / 20 GB"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface-muted px-4 py-3">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button href="/pricing">Upgrade or downgrade</Button>
            <Button variant="secondary" type="button">
              Download invoice
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Billing history</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["Aug 1, 2026", "$49.00", "Paid"],
              ["Jul 1, 2026", "$49.00", "Paid"],
              ["Jun 1, 2026", "$49.00", "Paid"],
            ].map(([date, amount, status]) => (
              <li
                key={date}
                className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-3"
              >
                <span>
                  {date}
                  <span className="block text-xs text-muted">{status}</span>
                </span>
                <span className="font-semibold">{amount}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
