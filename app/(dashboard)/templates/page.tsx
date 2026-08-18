"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives";
import {
  ApiError,
  getAccessToken,
  sitesApi,
  templatesApi,
  type ContentTemplate,
  type WpSite,
} from "@/lib/api";

const emptyForm = {
  name: "",
  siteId: "",
  category: "",
  tags: "",
  contentBefore: "",
  contentAfter: "",
  isDefault: false,
};

export default function TemplatesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<WpSite[]>([]);
  const [items, setItems] = useState<ContentTemplate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [sitesRes, templatesRes] = await Promise.all([
      sitesApi.list(),
      templatesApi.list(),
    ]);
    setSites(sitesRes.data);
    setItems(templatesRes.data);
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    load().catch((err) => setError(err.message || "Failed to load templates"));
  }, [router]);

  function startCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      siteId: sites[0]?.id || "",
    });
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function startEdit(t: ContentTemplate) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      siteId: t.siteId || "",
      category: t.category || "",
      tags: (t.tags || []).join(", "),
      contentBefore: t.contentBefore || "",
      contentAfter: t.contentAfter || "",
      isDefault: t.isDefault,
    });
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Template name is required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const body = {
      name: form.name.trim(),
      siteId: form.siteId || undefined,
      category: form.category.trim() || undefined,
      tags: form.tags
        .split(/[,|;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      contentBefore: form.contentBefore || undefined,
      contentAfter: form.contentAfter || undefined,
      isDefault: form.isDefault,
    };
    try {
      if (editingId) {
        await templatesApi.update(editingId, body);
        setMessage("Template updated.");
      } else {
        await templatesApi.create(body);
        setMessage("Template created.");
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function createPreset() {
    setLoading(true);
    setError("");
    try {
      await templatesApi.createSeoPreset(sites[0]?.id);
      setMessage(
        "SEO Structured Post template created and set as default for that site.",
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Preset failed");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this template?")) return;
    setLoading(true);
    try {
      await templatesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Templates
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            WordPress theme controls header/nav layout. SheetPress templates
            wrap your article HTML (intro box, CTA, author bio) every time you
            publish — set one as <strong>default</strong> to reuse automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={createPreset}
          >
            Add SEO structure preset
          </Button>
          <Button type="button" disabled={loading} onClick={startCreate}>
            Create template
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

      {showForm ? (
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">
            {editingId ? "Edit template" : "New template"}
          </h2>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Site (optional — leave empty for all sites)"
            value={form.siteId}
            onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
          >
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Default category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            />
            <Input
              label="Default tags"
              placeholder="seo, ranking"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <Textarea
            label="HTML before content (intro / structure)"
            className="min-h-28 font-mono text-xs"
            value={form.contentBefore}
            onChange={(e) =>
              setForm((f) => ({ ...f, contentBefore: e.target.value }))
            }
          />
          <Textarea
            label="HTML after content (CTA / author bio)"
            className="min-h-28 font-mono text-xs"
            value={form.contentAfter}
            onChange={(e) =>
              setForm((f) => ({ ...f, contentAfter: e.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
            />
            Use as default on publish for this site
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled={loading} onClick={save}>
              {loading ? "Saving…" : "Save template"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {items.length === 0 ? (
          <Card className="p-6 md:col-span-2">
            <p className="text-sm text-muted">
              No templates yet. Click <strong>Add SEO structure preset</strong>{" "}
              for a ready intro + CTA + author bio wrapper, or create your own.
            </p>
          </Card>
        ) : (
          items.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{template.name}</h2>
                {template.isDefault ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    Default
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Site</dt>
                  <dd className="font-medium">
                    {template.site?.name || "All sites"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Category</dt>
                  <dd className="font-medium">{template.category || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Tags</dt>
                  <dd className="font-medium">
                    {(template.tags || []).join(", ") || "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-muted">
                {(template.contentBefore ? "Intro HTML · " : "") +
                  (template.contentAfter ? "CTA / bio HTML" : "No HTML wrapper yet")}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => startEdit(template)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => remove(template.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
