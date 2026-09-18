"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  ImageIcon,
  Import,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
  Search,
  Settings,
  Globe2,
  ListOrdered,
  X,
  CreditCard,
  Layers3,
  Shield,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { Badge } from "@/components/ui/primitives";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  authApi,
  clearSession,
  getAccessToken,
  getStoredUser,
  setSession,
  usersApi,
  type UserProfile,
} from "@/lib/api";

const PIN_KEY = "sp_sidebar_pinned";
const RAIL = "4.75rem";
const WIDE = "17rem";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, feature: null },
  { href: "/sites", label: "Websites", icon: Globe2, feature: "sites" },
  { href: "/import", label: "Import Articles", icon: Import, feature: "import" },
  { href: "/articles", label: "All Articles", icon: FileText, feature: "articles" },
  { href: "/queue", label: "Publishing Queue", icon: ListOrdered, feature: "queue" },
  { href: "/calendar", label: "Content Calendar", icon: CalendarDays, feature: "calendar" },
  { href: "/media", label: "Media", icon: ImageIcon, feature: "media" },
  { href: "/templates", label: "Templates", icon: Layers3, feature: "templates" },
  { href: "/activity", label: "Activity Logs", icon: Activity, feature: "activity" },
  { href: "/subscription", label: "Subscription", icon: CreditCard, feature: "subscription" },
  { href: "/settings", label: "Settings", icon: Settings, feature: "settings" },
  { href: "/admin", label: "Admin", icon: Shield, feature: "admin" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const expanded = pinned || hovered;

  useEffect(() => {
    try {
      if (localStorage.getItem(PIN_KEY) === "1") setPinned(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) return;
    const cached = getStoredUser<UserProfile>();
    if (cached) setProfile(cached);
    usersApi
      .me()
      .then((res) => {
        setProfile(res.data);
        const tokens = {
          accessToken: getAccessToken() || "",
          refreshToken:
            typeof window !== "undefined"
              ? localStorage.getItem("yr_refresh_token") || ""
              : "",
        };
        if (tokens.accessToken)
          setSession(tokens, res.data as unknown as Record<string, unknown>);
      })
      .catch(() => undefined);
  }, []);

  const deniedList = profile?.deniedFeatures || [];
  const isAdmin = profile?.role === "ADMIN";

  const visibleNav = useMemo(
    () =>
      nav.filter((item) => {
        if (item.feature === "admin") return isAdmin;
        if (isAdmin) return true;
        if (!item.feature) return true;
        return !deniedList.includes(item.feature);
      }),
    [isAdmin, deniedList],
  );

  function togglePin() {
    setPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PIN_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      clearSession();
    }
    router.push("/login");
  }

  const initials = (profile?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function NavItem({
    item,
    showLabel,
    withTooltip,
  }: {
    item: (typeof nav)[number];
    showLabel: boolean;
    withTooltip: boolean;
  }) {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const link = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
          showLabel ? "gap-3 px-3" : "justify-center px-0",
          active
            ? "bg-gradient-to-r from-[#0b3d91] to-[#087990] text-white shadow-lg shadow-cyan-500/10"
            : "text-slate-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition",
            !active && "text-slate-500 group-hover:text-accent",
            active && "text-white",
          )}
        />
        {showLabel ? (
          <span className="truncate">{item.label}</span>
        ) : (
          <span className="sr-only">{item.label}</span>
        )}
      </Link>
    );

    if (!withTooltip) return link;
    return (
      <Tooltip label={item.label} disabled={showLabel}>
        {link}
      </Tooltip>
    );
  }

  const DesktopNav = ({ showLabel }: { showLabel: boolean }) => (
    <nav className={cn("space-y-0.5", showLabel ? "px-3" : "px-2")}>
      {showLabel ? (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
      ) : (
        <div className="mb-2 h-4" />
      )}
      {visibleNav.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          showLabel={showLabel}
          withTooltip={!showLabel}
        />
      ))}
      {showLabel ? (
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      ) : (
        <Tooltip label="Logout">
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center rounded-lg py-2.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
            aria-label="Logout"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </Tooltip>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-dashboard font-[family-name:var(--font-outfit)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-[var(--sidebar)] transition-[width] duration-200 ease-out lg:flex",
          expanded ? "shadow-2xl shadow-black/40" : "",
        )}
        style={{ width: expanded ? WIDE : RAIL }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-white/5",
            expanded ? "gap-3 px-4" : "justify-center px-2",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-md shadow-cyan-500/20">
            <FileSpreadsheet className="h-[18px] w-[18px]" />
          </span>
          {expanded ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-tight text-white">
                {brand.name}
              </p>
              <p className="truncate text-[11px] text-slate-500">Publish OS</p>
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <DesktopNav showLabel={expanded} />
        </div>

        {expanded ? (
          <div className="border-t border-white/5 p-3">
            <div className="rounded-xl bg-[var(--sidebar-elevated)] p-3 ring-1 ring-white/5">
              <p className="text-[11px] font-medium text-slate-400">Signed in</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {profile?.name || "Loading…"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {profile?.email || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t border-white/5 p-2">
            <Tooltip label={profile?.name || "Account"}>
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-[10px] font-bold text-white">
                {initials}
              </div>
            </Tooltip>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[18rem] flex-col bg-[var(--sidebar)] shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
              <span className="font-semibold text-white">{brand.name}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <DesktopNav showLabel />
            </div>
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-200 ease-out",
          pinned ? "lg:pl-[17rem]" : "lg:pl-[4.75rem]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-[var(--topbar)] px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="rounded-xl p-2 text-foreground hover:bg-surface-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Tooltip label={pinned ? "Collapse sidebar" : "Pin sidebar open"} side="bottom">
            <button
              type="button"
              onClick={togglePin}
              className={cn(
                "hidden rounded-xl border p-2 shadow-sm transition lg:inline-flex",
                pinned
                  ? "border-accent/40 bg-accent-soft text-brand"
                  : "border-border/80 bg-white text-muted hover:border-accent/40 hover:text-foreground",
              )}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-pressed={pinned}
            >
              {pinned ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>
          </Tooltip>

          <div className="relative hidden max-w-lg flex-1 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-xl border border-border/80 bg-white/90 pl-10 pr-3 text-sm shadow-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
              placeholder="Search articles, sites, batches…"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {isAdmin ? (
              <Badge tone="accent" className="hidden sm:inline-flex">
                Admin
              </Badge>
            ) : (
              <Badge tone="brand" className="hidden sm:inline-flex">
                Professional
              </Badge>
            )}
            <button
              type="button"
              className="relative rounded-xl border border-border/80 bg-white p-2 text-muted shadow-sm transition hover:border-accent/40 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <Link
              href="/docs"
              className="hidden items-center gap-1.5 rounded-xl border border-border/80 bg-white px-3 py-2 text-sm font-medium text-muted shadow-sm transition hover:border-brand/30 hover:text-foreground sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white shadow-md shadow-brand/25">
              {initials}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
