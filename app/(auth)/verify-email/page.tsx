import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
      <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
        Verify your email
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        We sent a verification link to your inbox. Confirm your email to unlock
        publishing features.
      </p>
      <div className="mt-6 space-y-3">
        <Button className="w-full" type="button">
          Resend verification email
        </Button>
        <Input label="Change email address" type="email" placeholder="new@email.com" />
        <Button variant="secondary" className="w-full" type="button">
          Update email
        </Button>
        <Button href="/onboarding" variant="ghost" className="w-full">
          Continue to onboarding
        </Button>
      </div>
    </div>
  );
}
