import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { mediaItems } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Media" };

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Media
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track uploaded images, WordPress media IDs, failed uploads, and reuse.
          </p>
        </div>
        <Button type="button">Upload images</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mediaItems.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex h-28 items-center justify-center rounded-xl bg-surface-muted text-sm text-muted">
              Preview
            </div>
            <p className="mt-3 truncate text-sm font-semibold">{item.name}</p>
            <p className="mt-1 text-xs text-muted">
              WP ID: {item.wpId} · {item.size}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusBadge status={item.status} />
              <Button size="sm" variant="ghost" type="button">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
