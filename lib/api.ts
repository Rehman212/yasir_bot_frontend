const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_KEY = "yr_access_token";
const REFRESH_KEY = "yr_refresh_token";
const USER_KEY = "yr_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setSession(
  tokens: AuthTokens,
  user?: Record<string, unknown> | null,
) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearSession();
    return null;
  }

  const json = await res.json();
  const data = json.data ?? json;
  if (data.accessToken && data.refreshToken) {
    setSession(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      data.user,
    );
    return data.accessToken as string;
  }
  return null;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
};

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, formData } = options;
  const headers: Record<string, string> = {};

  if (!formData) headers["Content-Type"] = "application/json";

  let token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && auth) {
    token = await refreshAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      res = await doFetch();
    }
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    const message =
      (json as { message?: string | string[] })?.message ||
      res.statusText ||
      "Request failed";
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : String(message),
      res.status,
      json,
    );
  }

  return json as T;
}

export const authApi = {
  signup: (data: {
    name: string;
    email: string;
    password: string;
  }) => api<{ data: { user: Record<string, unknown> } & AuthTokens }>("/auth/signup", {
    method: "POST",
    body: data,
    auth: false,
  }),
  login: (data: { email: string; password: string }) =>
    api<{ data: { user: Record<string, unknown> } & AuthTokens }>("/auth/login", {
      method: "POST",
      body: data,
      auth: false,
    }),
  logout: () =>
    api("/auth/logout", {
      method: "POST",
      body: { refreshToken: getRefreshToken() },
    }).finally(() => clearSession()),
  forgotPassword: (email: string) =>
    api("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  resetPassword: (token: string, password: string) =>
    api("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      auth: false,
    }),
  verifyEmail: (token: string) =>
    api("/auth/verify-email", {
      method: "POST",
      body: { token },
      auth: false,
    }),
};

export type UserPreferences = {
  timezone?: string;
  defaultArticleStatus?: "draft" | "publish" | "schedule";
  publishIntervalSeconds?: number;
  retryLimit?: number;
  emailFailedPosts?: boolean;
  [key: string]: unknown;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences | null;
  subscription?: Record<string, unknown> | null;
};

export const usersApi = {
  me: () => api<{ data: UserProfile }>("/users/me"),
  updateProfile: (body: { name?: string; preferences?: UserPreferences }) =>
    api<{ data: UserProfile }>("/users/me", { method: "PATCH", body }),
  updatePreferences: (preferences: UserPreferences) =>
    api<{ data: { preferences: UserPreferences } }>("/users/me/preferences", {
      method: "PATCH",
      body: { preferences },
    }),
};

export const dashboardApi = {
  stats: () => api<{ data: DashboardStats }>("/dashboard/stats"),
};

export const sitesApi = {
  list: () => api<{ data: WpSite[] }>("/wordpress-sites"),
  get: (id: string) => api<{ data: WpSite }>(`/wordpress-sites/${id}`),
  create: (body: {
    name: string;
    url: string;
    username: string;
    applicationPassword: string;
  }) =>
    api<{ data: WpSite }>("/wordpress-sites", { method: "POST", body }),
  update: (
    id: string,
    body: Partial<{
      name: string;
      url: string;
      username: string;
      applicationPassword: string;
    }>,
  ) =>
    api<{ data: WpSite }>(`/wordpress-sites/${id}`, {
      method: "PATCH",
      body,
    }),
  test: (id: string) =>
    api<{ data: { connected?: boolean; site?: WpSite; info?: unknown } & Partial<WpSite> }>(
      `/wordpress-sites/${id}/test-connection`,
      { method: "POST" },
    ),
  remove: (id: string) =>
    api(`/wordpress-sites/${id}`, { method: "DELETE" }),
  seoBridge: (siteId: string) =>
    api<{
      data: {
        installed: boolean;
        version?: string;
        rank_math?: boolean;
        message?: string;
      };
    }>(`/wordpress-integration/${siteId}/seo-bridge`),
};

export const articlesApi = {
  list: (query?: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v) qs.set(k, v);
      });
    }
    const suffix = qs.toString() ? `?${qs}` : "";
    return api<{ data: ArticleDetail[] }>(`/articles${suffix}`);
  },
  get: (id: string) => api<{ data: ArticleDetail }>(`/articles/${id}`),
  update: (
    id: string,
    body: Partial<{
      title: string;
      content: string;
      excerpt: string;
      slug: string;
      status: string;
      category: string;
      tags: string[];
      featuredImageUrl: string;
      seoTitle: string;
      seoDescription: string;
      focusKeyword: string;
      lsiKeywords: string;
      templateId: string;
      publishAt: string;
    }>,
  ) => api<{ data: ArticleDetail }>(`/articles/${id}`, { method: "PATCH", body }),
  remove: (id: string) => api(`/articles/${id}`, { method: "DELETE" }),
};

export const importsApi = {
  upload: (siteId: string, file: File, columnMapping?: Record<string, string>) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("siteId", siteId);
    if (columnMapping) {
      formData.append("columnMapping", JSON.stringify(columnMapping));
    }
    return api<{
      data: {
        batch: { id: string; filename?: string | null; rowCount: number; status: string };
        imported: number;
        articles: ArticleRow[];
        errors: Array<{ row: number; message: string }>;
      };
    }>(`/imports/upload?siteId=${encodeURIComponent(siteId)}`, {
      method: "POST",
      formData,
    });
  },
  history: () =>
    api<{
      data: Array<{
        id: string;
        filename?: string | null;
        rowCount: number;
        status: string;
        createdAt: string;
      }>;
    }>("/imports/history"),
};

export const mediaApi = {
  list: (siteId?: string) => {
    const qs = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
    return api<{ data: MediaAsset[] }>(`/media${qs}`);
  },
  uploadFromUrl: (siteId: string, sourceUrl: string, filename?: string) =>
    api<{ data: MediaAsset }>("/media/upload-from-url", {
      method: "POST",
      body: { siteId, sourceUrl, filename },
    }),
  uploadFile: (siteId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("siteId", siteId);
    return api<{ data: MediaAsset }>(
      `/media/upload?siteId=${encodeURIComponent(siteId)}`,
      { method: "POST", formData },
    );
  },
  retry: (id: string) => api(`/media/${id}/retry`, { method: "POST" }),
  remove: (id: string) => api(`/media/${id}`, { method: "DELETE" }),
};

export type MediaAsset = {
  id: string;
  sourceUrl: string;
  filename?: string | null;
  wpMediaId?: number | null;
  status: string;
  sizeBytes?: number | null;
  error?: string | null;
  site?: { id: string; name: string };
};

export const queueApi = {
  list: () => api<{ data: QueueRow[] }>("/queue"),
  pause: () => api("/queue/pause", { method: "POST" }),
  resume: () => api("/queue/resume", { method: "POST" }),
  retry: (id: string) => api(`/queue/${id}/retry`, { method: "POST" }),
  cancel: (id: string) => api(`/queue/${id}/cancel`, { method: "POST" }),
};

export const publishingApi = {
  draft: (articleId: string) =>
    api("/publishing/draft", { method: "POST", body: { articleId } }),
  publish: (articleId: string) =>
    api("/publishing/publish", { method: "POST", body: { articleId } }),
  schedule: (articleId: string, publishAt: string, timezone = "UTC") =>
    api("/publishing/schedule", {
      method: "POST",
      body: { articleId, publishAt, timezone },
    }),
  update: (articleId: string) =>
    api("/publishing/update", { method: "POST", body: { articleId } }),
};

export type ContentTemplate = {
  id: string;
  name: string;
  siteId?: string | null;
  category?: string | null;
  tags?: string[];
  contentBefore?: string | null;
  contentAfter?: string | null;
  isDefault: boolean;
  site?: { id: string; name: string } | null;
};

export const templatesApi = {
  list: (siteId?: string) => {
    const qs = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
    return api<{ data: ContentTemplate[] }>(`/templates${qs}`);
  },
  create: (body: {
    name: string;
    siteId?: string;
    category?: string;
    tags?: string[];
    contentBefore?: string;
    contentAfter?: string;
    isDefault?: boolean;
  }) => api<{ data: ContentTemplate }>("/templates", { method: "POST", body }),
  createSeoPreset: (siteId?: string) =>
    api<{ data: ContentTemplate }>("/templates/presets/seo-structure", {
      method: "POST",
      body: { siteId },
    }),
  update: (
    id: string,
    body: Partial<{
      name: string;
      siteId: string | null;
      category: string | null;
      tags: string[];
      contentBefore: string | null;
      contentAfter: string | null;
      isDefault: boolean;
    }>,
  ) =>
    api<{ data: ContentTemplate }>(`/templates/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) => api(`/templates/${id}`, { method: "DELETE" }),
};

export type WpSite = {
  id: string;
  name: string;
  url: string;
  username?: string;
  status: string;
  publishedCount: number;
  lastConnectedAt?: string | null;
};

export type ArticleRow = {
  id: string;
  title: string;
  status: string;
  category?: string | null;
  publishAt?: string | null;
  wpUrl?: string | null;
  site?: { id?: string; name: string; url?: string };
};

export type ArticleDetail = ArticleRow & {
  content?: string;
  excerpt?: string | null;
  slug?: string | null;
  tags?: string[];
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  lsiKeywords?: string | null;
  templateId?: string | null;
  siteId?: string;
  wpPostId?: number | null;
  errorMessage?: string | null;
};

export type QueueRow = {
  id: string;
  status: string;
  progress: number;
  error?: string | null;
  article?: { title: string };
  site?: { name: string };
};

export type DashboardStats = {
  stats: { label: string; value: string }[];
  recentImports: { id: string; label: string; status: string }[];
  upcoming: {
    id: string;
    title: string;
    publishDate?: string | null;
    website: string;
  }[];
  recentActivity: {
    id: string;
    event: string;
    detail: string;
    time: string;
  }[];
  failedCount: number;
};
