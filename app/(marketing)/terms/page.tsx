import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms & Conditions"
        description="The rules that govern use of SheetPress accounts, subscriptions, and publishing features."
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-sm leading-relaxed text-muted sm:px-6">
        <p>
          By creating an account you agree to use SheetPress lawfully, keep
          credentials secure, and respect WordPress site ownership permissions.
        </p>
        <p>
          Plans may include article, website, storage, and seat limits. Abuse,
          scraping, or unauthorized access attempts may result in suspension.
        </p>
        <p>Last updated: August 17, 2026.</p>
      </section>
    </>
  );
}
