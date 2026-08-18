"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, StatusBadge } from "@/components/ui/primitives";
import {
  ApiError,
  articlesApi,
  getAccessToken,
  publishingApi,
  sitesApi,
  templatesApi,
  type ArticleDetail,
  type ContentTemplate,
} from "@/lib/api";

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [lsiKeywords, setLsiKeywords] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [publishAt, setPublishAt] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bridgeInstalled, setBridgeInstalled] = useState<boolean | null>(null);

  const siteName = useMemo(
    () => article?.site?.name || "Unknown site",
    [article],
  );

  async function load() {
    const res = await articlesApi.get(id);
    const a = res.data;
    setArticle(a);
    setTitle(a.title || "");
    setSlug(a.slug || "");
    setContent(a.content || "");
    setExcerpt(a.excerpt || "");
    setFeaturedImageUrl(a.featuredImageUrl || "");
    setCategory(a.category || "");
    setTags((a.tags || []).join(", "));
    setSeoTitle(a.seoTitle || "");
    setSeoDescription(a.seoDescription || "");
    setFocusKeyword(a.focusKeyword || "");
    setLsiKeywords(a.lsiKeywords || "");
    setTemplateId(a.templateId || "");
    setPublishAt(toLocalInput(a.publishAt));
    setStatus(a.status || "DRAFT");
    if (a.siteId) {
      templatesApi
        .list(a.siteId)
        .then((t) => setTemplates(t.data))
        .catch(() => setTemplates([]));
      sitesApi
        .seoBridge(a.siteId)
        .then((b) => setBridgeInstalled(Boolean(b.data.installed)))
        .catch(() => setBridgeInstalled(false));
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    load().catch((err) => setError(err.message || "Failed to load article"));
  }, [id, router]);

  async function save() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await articlesApi.update(id, {
        title,
        slug: slug || undefined,
        content,
        excerpt: excerpt || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
        category: category || undefined,
        tags: tags
          .split(/[,|;]/)
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        focusKeyword: focusKeyword || undefined,
        lsiKeywords: lsiKeywords || undefined,
        templateId: templateId || undefined,
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        status,
      });
      setArticle(res.data);
      setMessage("Article saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveAsDraftWp() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await saveQuiet();
      await publishingApi.draft(id);
      await load();
      setMessage("WordPress draft created/updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Draft publish failed");
    } finally {
      setLoading(false);
    }
  }

  async function publishNow() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await saveQuiet();
      const alreadyOnWp = Boolean(article?.wpPostId);
      const res = (alreadyOnWp
        ? await publishingApi.update(id)
        : await publishingApi.publish(id)) as {
        warning?: string;
        seoWarning?: string;
        data?: { seoWarning?: string; errorMessage?: string | null };
      };
      await load();
      const warning = res.warning || res.seoWarning || res.data?.seoWarning;
      if (warning) {
        setBridgeInstalled(false);
        setError(warning);
        setMessage("");
      } else {
        setBridgeInstalled(true);
        setMessage(
          alreadyOnWp
            ? "Updated on WordPress — Rank Math SEO title, description, and focus keyword synced."
            : "Published to WordPress — Rank Math SEO fields synced. Hard-refresh the WP post editor.",
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  async function scheduleNow() {
    if (!publishAt) {
      setError("Set a publish date/time first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await saveQuiet();
      await publishingApi.schedule(id, new Date(publishAt).toISOString());
      await load();
      setMessage("Scheduled on WordPress.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Schedule failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveQuiet() {
    await articlesApi.update(id, {
      title,
      slug: slug || undefined,
      content,
      excerpt: excerpt || undefined,
      featuredImageUrl: featuredImageUrl || undefined,
      category: category || undefined,
      tags: tags
        .split(/[,|;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      focusKeyword: focusKeyword || undefined,
      lsiKeywords: lsiKeywords || undefined,
      templateId: templateId || "",
      publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
      status,
    });
  }

  if (!article) {
    return <p className="text-sm text-muted">{error || "Loading article…"}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight">
            Article editor
          </h1>
          <p className="mt-1 text-sm text-muted">
            {siteName}
            {article.wpUrl ? (
              <>
                {" · "}
                <a
                  href={article.wpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline"
                >
                  Open on WordPress
                </a>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={article.status} />
          <Button href="/articles" variant="ghost" type="button">
            Back
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={loading}
            onClick={save}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={loading}
            onClick={saveAsDraftWp}
          >
            Save as WP draft
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={loading}
            onClick={scheduleNow}
          >
            Schedule
          </Button>
          <Button type="button" disabled={loading} onClick={publishNow}>
            {article.wpPostId ? "Update on WordPress" : "Publish now"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

      {bridgeInstalled === false ? (
        <Card className="space-y-3 border-danger/40 bg-danger/5 p-5">
          <h2 className="font-semibold text-danger">
            Rank Math SEO fields need SheetPress SEO Bridge
          </h2>
          <p className="text-sm text-muted">
            WordPress / Rank Math block Focus Keyword, SEO Title, and Meta
            Description over the REST API. Install this small plugin once on{" "}
            <strong>yasirbhatti.com</strong>, then click{" "}
            <strong>Update on WordPress</strong> again.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>
              Download{" "}
              <a
                href="/sheetpress-seo-bridge.zip"
                className="font-medium text-brand hover:underline"
              >
                sheetpress-seo-bridge.zip
              </a>
            </li>
            <li>
              WP Admin → Plugins → Add New → Upload Plugin → Install → Activate
            </li>
            <li>
              Back here → <strong>Update on WordPress</strong> → hard-refresh
              the Rank Math screen
            </li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button href="/sheetpress-seo-bridge.zip" variant="secondary" size="sm">
              Download plugin zip
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading || !article.siteId}
              onClick={async () => {
                if (!article.siteId) return;
                setLoading(true);
                try {
                  const b = await sitesApi.seoBridge(article.siteId);
                  setBridgeInstalled(Boolean(b.data.installed));
                  setMessage(
                    b.data.installed
                      ? "SEO Bridge detected. Click Update on WordPress now."
                      : b.data.message || "Plugin still not detected.",
                  );
                  if (!b.data.installed) {
                    setError(
                      b.data.message ||
                        "Plugin still not installed/activated on WordPress.",
                    );
                  } else {
                    setError("");
                  }
                } catch (err) {
                  setError(
                    err instanceof ApiError
                      ? err.message
                      : "Could not check SEO Bridge",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              Check if plugin is active
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="space-y-4 p-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Textarea
            label="Content"
            className="min-h-56"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Textarea
            label="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </Card>
        <Card className="space-y-4 p-6">
          <Input
            label="Featured image URL"
            placeholder="https://example.com/image.jpg"
            hint="Must be a full public https URL. Sheet column: Featured Image"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
          />
          {featuredImageUrl ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImageUrl}
                alt="Featured preview"
                className="max-h-40 w-full object-cover"
              />
            </div>
          ) : null}
          {article.errorMessage ? (
            <p className="text-sm text-danger">{article.errorMessage}</p>
          ) : null}
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="Tags"
            placeholder="seo, wordpress, automation"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <Input
            label="SEO title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          <Textarea
            label="Meta description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
          <Select
            label="Content template"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            <option value="">Site default (or none)</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.isDefault ? " (default)" : ""}
              </option>
            ))}
          </Select>
          <Input
            label="Focus keyword"
            placeholder="seo guide"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
          />
          <Input
            label="LSI keywords"
            placeholder="keyword research, on page seo, content ranking"
            hint="Comma-separated. Synced to Rank Math as secondary focus keywords."
            value={lsiKeywords}
            onChange={(e) => setLsiKeywords(e.target.value)}
          />
          <Input
            label="Publish date"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
          />
          <Select
            label="Post status (in SheetPress)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="QUEUED">Queued</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="FAILED">Failed</option>
          </Select>
          <p className="text-xs text-muted">
            SheetPress SEO values sync to Rank Math only after the SEO Bridge
            plugin is installed. Then use{" "}
            <strong>Update on WordPress</strong>.
          </p>
        </Card>
      </div>
    </div>
  );
}
