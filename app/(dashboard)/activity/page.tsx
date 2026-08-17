import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";
import { activityLogs } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Activity Logs" };

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
          Activity Logs
        </h1>
        <p className="mt-1 text-sm text-muted">
          Imports, edits, publishing events, media uploads, failures, and retries.
        </p>
      </div>
      <Card className="divide-y divide-border">
        {activityLogs.map((log) => (
          <div key={log.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-semibold text-foreground">{log.event}</p>
              <p className="mt-1 text-sm text-muted">{log.detail}</p>
            </div>
            <p className="text-xs font-medium text-muted">{log.time}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
