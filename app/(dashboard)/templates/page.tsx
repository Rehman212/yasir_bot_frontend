import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { templates } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Templates
          </h1>
          <p className="mt-1 text-sm text-muted">
            Save reusable defaults for category, tags, author, formatting, and frequency.
          </p>
        </div>
        <Button type="button">Create template</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="p-6">
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Default category</dt>
                <dd className="font-medium">{template.category}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Default tags</dt>
                <dd className="font-medium">{template.tags}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Default status</dt>
                <dd className="font-medium">{template.status}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Publishing frequency</dt>
                <dd className="font-medium">{template.frequency}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              Also includes CTA after content, author bio, and formatting defaults.
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" type="button">
                Edit
              </Button>
              <Button size="sm" variant="ghost" type="button">
                Duplicate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
