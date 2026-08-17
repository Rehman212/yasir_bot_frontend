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
  type ArticleDetail,
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
  const [publishAt, setPublishAt] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    setPublishAt(toLocalInput(a.publishAt));
    setStatus(a.status || "DRAFT");
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
      await publishingApi.publish(id);
      await load();
      setMessage("Published to WordPress.");
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
            Publish now
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-brand">{message}</p> : null}

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
            placeholder="https://…"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
          />
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
          <Input
            label="Focus keyword"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
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
            Status dropdown updates SheetPress only. Use{" "}
            <strong>Publish now</strong> / <strong>Save as WP draft</strong> to
            push to WordPress.
          </p>
        </Card>
      </div>
    </div>
  );
}
