"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const scheduled: Record<number, string[]> = {
  20: ["SEO Guide"],
  22: ["Content Calendar"],
  25: ["Rank Math Checklist"],
  28: ["Agency Reporting"],
};

export default function CalendarPage() {
  const [view, setView] = useState<"Monthly" | "Weekly" | "Daily">("Monthly");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monthly, weekly, and daily views with drag-and-drop rescheduling.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["Monthly", "Weekly", "Daily"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold",
                view === mode
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-muted",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select label="Filter by website" className="max-w-xs">
            <option>All websites</option>
            <option>Growth Lab Blog</option>
            <option>Northline Agency</option>
          </Select>
          <p className="self-end pb-2 text-sm text-muted">
            August 2026 · drag cards onto another day to reschedule
          </p>
        </div>

        {view === "Monthly" ? (
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-1 text-xs font-semibold text-muted">
                {d}
              </div>
            ))}
            {days.map((day) => (
              <div
                key={day}
                className="min-h-24 rounded-xl border border-border bg-surface-muted p-2"
              >
                <p className="text-xs font-semibold text-muted">{day}</p>
                <div className="mt-2 space-y-1">
                  {(scheduled[day] ?? []).map((title) => (
                    <button
                      key={title}
                      type="button"
                      draggable
                      className="w-full cursor-grab rounded-lg bg-brand px-2 py-1 text-left text-[11px] font-medium text-white"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(scheduled).map(([day, titles]) => (
              <div
                key={day}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">August {day}, 2026</p>
                  <p className="text-sm text-muted">{titles.join(", ")}</p>
                </div>
                <Button size="sm" variant="secondary" type="button">
                  Open details
                </Button>
              </div>
            ))}
            <p className="text-sm text-muted">
              Tip: identify publishing gaps and fill empty weekdays with queued drafts.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
