"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <PageHero
        title="Simple pricing for every publishing volume"
        description="Compare monthly and annual plans across articles, websites, storage, team seats, SEO features, and support."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold",
                !annual ? "bg-brand text-white" : "text-muted",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold",
                annual ? "bg-brand text-white" : "text-muted",
              )}
            >
              Annual · save ~20%
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {pricingPlans.map((plan) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-2xl border p-6",
                  plan.featured
                    ? "border-brand bg-brand text-white shadow-[var(--shadow-lg)]"
                    : "border-border bg-white",
                )}
              >
                <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
                  {plan.name}
                </p>
                <p className="mt-3 font-[family-name:var(--font-sora)] text-4xl font-semibold">
                  ${price}
                  <span className="text-base font-medium opacity-70">/mo</span>
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    plan.featured ? "text-white/80" : "text-muted",
                  )}
                >
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    plan.articles,
                    plan.websites,
                    plan.storage,
                    plan.team,
                    plan.seo,
                    plan.support,
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href="/signup"
                  className="mt-8"
                  variant={plan.featured ? "secondary" : "primary"}
                >
                  Get started
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
