import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        description="How SheetPress collects, uses, and protects account and publishing data."
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-sm leading-relaxed text-muted sm:px-6">
        <p>
          We collect account information, site connection metadata, import
          history, and usage metrics needed to operate the product.
        </p>
        <p>
          WordPress credentials are stored encrypted. We do not sell personal
          data. You may request export or deletion of your account data by
          contacting support.
        </p>
        <p>Last updated: August 17, 2026.</p>
      </section>
    </>
  );
}
