"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Common aliases kept for existing saved prefs (default stays PKT). */
const ALIASES: { value: string; label: string }[] = [
  { value: "PKT", label: "PKT (Pakistan Standard Time, UTC+5)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "EST", label: "EST (Eastern Standard Time)" },
  { value: "PST", label: "PST (Pacific Standard Time)" },
  { value: "GMT", label: "GMT (Greenwich Mean Time)" },
  { value: "CET", label: "CET (Central European Time)" },
  { value: "IST", label: "IST (India Standard Time, UTC+5:30)" },
  { value: "BST", label: "BST (British Summer Time)" },
  { value: "CST", label: "CST (Central Standard Time)" },
  { value: "JST", label: "JST (Japan Standard Time)" },
  { value: "AEST", label: "AEST (Australian Eastern Standard Time)" },
  { value: "GST", label: "GST (Gulf Standard Time, UTC+4)" },
];

function ianaZones(): string[] {
  try {
    const supported = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (supported?.length) return supported;
  } catch {
    /* ignore */
  }
  return [
    "Asia/Karachi",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];
}

function offsetLabel(zone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

export function TimezonePicker({
  value,
  onChange,
  label = "Timezone",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const iana = ianaZones().map((z) => {
      const off = offsetLabel(z);
      return {
        value: z,
        label: off ? `${z.replace(/_/g, " ")} (${off})` : z.replace(/_/g, " "),
        group: "IANA",
      };
    });
    return [
      ...ALIASES.map((a) => ({ ...a, group: "Common" })),
      ...iana,
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.value.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || value || "Select timezone";

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="relative border-b border-border/80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or timezone…"
            className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted/70"
          />
        </div>
        <div className="border-b border-border/60 bg-surface-muted/60 px-3 py-2 text-xs text-muted">
          Selected:{" "}
          <span className="font-semibold text-foreground">{selectedLabel}</span>
        </div>
        <div className="max-h-52 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">No timezones match.</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={`${opt.group}-${opt.value}`}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                  value === opt.value
                    ? "bg-brand-soft text-brand"
                    : "text-foreground hover:bg-surface-muted",
                )}
              >
                <span className="min-w-0">
                  <span className="block font-medium">{opt.label}</span>
                  <span className="block text-[11px] text-muted">{opt.value}</span>
                </span>
                {value === opt.value ? (
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide">
                    Active
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
      <p className="text-xs text-muted">
        Default remains <strong>PKT</strong> unless you change it.
      </p>
    </div>
  );
}
