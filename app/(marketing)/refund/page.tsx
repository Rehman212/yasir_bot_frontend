import type { Metadata } from "next";
import { PageHero } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <>
      <PageHero
        title="Refund Policy"
        description="Clear guidelines for cancellations and eligible refund requests."
      />
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-sm leading-relaxed text-muted sm:px-6">
        <p>
          Monthly plans can be cancelled anytime and stop renewing at the end of
          the current billing period.
        </p>
        <p>
          Annual plan refunds may be considered within 14 days of purchase if
          usage remains under the free-plan article limit. Contact support with
          your account email to request a review.
        </p>
        <p>Last updated: August 17, 2026.</p>
      </section>
    </>
  );
}
