"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/brand";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { authApi, clearSession } from "@/lib/api";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/sites", label: "WordPress Sites", icon: Globe2 },
  { href: "/import", label: "Import Articles", icon: Import },
  { href: "/articles", label: "All Articles", icon: FileText },
  { href: "/queue", label: "Publishing Queue", icon: ListOrdered },
  { href: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/templates", label: "Templates", icon: Layers3 },
  { href: "/activity", label: "Activity Logs", icon: Activity },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      clearSession();
    }
    router.push("/login");
  }

  const NavLinks = () => (
    <nav className="space-y-1 px-3">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand text-white shadow-sm"
                : "text-muted hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <span className="font-[family-name:var(--font-sora)] text-lg font-semibold">
            {brand.name}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="font-[family-name:var(--font-sora)] font-semibold">
                {brand.name}
              </span>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4">
              <NavLinks />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-foreground lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-xl border border-border bg-surface-muted pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-[var(--ring)]"
              placeholder="Search articles, sites, batches…"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Badge tone="brand">Professional</Badge>
            <button
              type="button"
              className="rounded-xl border border-border p-2 text-muted hover:bg-surface-muted"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href="/docs"
              className="hidden items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-surface-muted sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
              AR
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
