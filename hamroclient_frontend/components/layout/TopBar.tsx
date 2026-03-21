"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

interface TopBarProps {
  onSearchOpen: () => void;
  onMobileMenuToggle: () => void;
  userName: string;
  onSignOut: () => void;
}

// Map pathnames to human-readable breadcrumb labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  staff: "Staff",
  applicants: "Applicants",
  applications: "Applications",
  board: "Pipeline",
  new: "Add New",
  documents: "Documents",
  reports: "Reports",
  export: "Export",
  audit: "Audit Log",
  settings: "Settings",
  users: "User Management",
  agency: "Agency Profile",
  notifications: "Notifications",
  "by-country": "By Country",
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    // Skip dynamic segments like [id]
    if (segment.startsWith("[") || segment.match(/^[0-9a-f-]{36}$/)) {
      crumbs.push({ label: "Detail", href: currentPath });
    } else {
      crumbs.push({
        label: ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    }
  }

  return crumbs;
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";
  if (last.match(/^[0-9a-f-]{36}$/)) return "Detail";
  return ROUTE_LABELS[last] || last.charAt(0).toUpperCase() + last.slice(1);
}

export default function TopBar({
  onSearchOpen,
  onMobileMenuToggle,
  userName,
  onSignOut,
}: TopBarProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
      {/* Left: Mobile menu + Page title + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>
        <h1 className="md:hidden text-sm font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-muted-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-background rounded border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {/* TODO: Conditionally render unread indicator when notification system is implemented */}
          {/* {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
          )} */}
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {userName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <span className="hidden lg:inline text-sm font-medium text-foreground truncate max-w-[120px]">
              {userName}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-popover border border-border rounded-xl shadow-lg py-1">
                <Link
                  href="/dashboard/admin/settings/agency"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
