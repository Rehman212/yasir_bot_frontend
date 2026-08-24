"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sv_software_promo_seen";

export function SoftwarePromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore
    }
    const t = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sv-promo-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-md)]"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Custom software
        </p>
        <h2
          id="sv-promo-title"
          className="mt-2 font-[family-name:var(--font-sora)] text-xl font-semibold tracking-tight text-foreground"
        >
          Need software like this for your business?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          If you want a custom web app, automation tool, or SaaS built for your
          workflow, contact{" "}
          <a
            href={brand.company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            {brand.company.displayUrl}
          </a>
          .
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            href={brand.company.whatsappLink}
            className="w-full sm:flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {brand.company.whatsapp}
          </Button>
          <Button
            href={brand.company.url}
            variant="secondary"
            className="w-full sm:flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit website
          </Button>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 w-full text-center text-sm text-muted hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
