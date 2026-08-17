import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { queueItems } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Publishing Queue" };

const sections = ["Waiting", "Processing", "Scheduled", "Completed", "Failed", "Cancelled"];

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Publishing Queue
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pause, resume, cancel, retry, and inspect errors across every job.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" type="button">
            Pause queue
          </Button>
          <Button type="button">Resume queue</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => {
          const items = queueItems.filter((item) => item.status === section);
          return (
            <Card key={section} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{section}</h2>
                <StatusBadge status={section} />
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted">No jobs in this section.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border bg-surface-muted px-3 py-3 text-sm"
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-muted">{item.site}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost" type="button">
                          View error
                        </Button>
                        <Button size="sm" variant="ghost" type="button">
                          Retry
                        </Button>
                        <Button size="sm" variant="ghost" type="button">
                          Cancel
                        </Button>
                        <Button size="sm" variant="ghost" type="button">
                          View post
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
