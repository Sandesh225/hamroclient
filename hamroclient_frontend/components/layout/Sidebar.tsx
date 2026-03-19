"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  FileText,
  Kanban,
  Globe,
  BarChart3,
  Download,
  History,
  Settings,
  Building2,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  role: "ADMIN" | "STAFF";
  userName: string;
  onSignOut: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
    ],
  },
  {
    title: "Applicants",
    items: [
      { name: "All Applicants", href: "/applicants", icon: Users },
      { name: "Add New", href: "/applicants/new", icon: UserPlus },
      { name: "Document Checklist", href: "/applicants/documents", icon: ClipboardList },
    ],
  },
  {
    title: "Applications",
    items: [
      { name: "Active Applications", href: "/applications", icon: FileText },
      { name: "Pipeline Tracker", href: "/applications/board", icon: Kanban },
      { name: "By Country", href: "/applications/by-country", icon: Globe },
    ],
  },
  {
    title: "Reports",
    adminOnly: true,
    items: [
      { name: "Analytics", href: "/dashboard/admin/reports", icon: BarChart3 },
      { name: "Export Data", href: "/dashboard/admin/reports/export", icon: Download },
      { name: "Audit Log", href: "/dashboard/admin/reports/audit", icon: History },
    ],
  },
  {
    title: "Settings",
    adminOnly: true,
    items: [
      { name: "User Management", href: "/dashboard/admin/settings/users", icon: Users },
      { name: "Agency Profile", href: "/dashboard/admin/settings/agency", icon: Building2 },
      { name: "Notifications", href: "/dashboard/admin/settings/notifications", icon: Bell },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ role, userName, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Default all groups expanded
    const map: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => (map[g.title] = true));
    return map;
  });

  // Auto-collapse below 1280px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleGroup = (title: string) => {
    if (collapsed) return;
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredGroups = NAV_GROUPS.filter(
    (group) => !group.adminOnly || role === "ADMIN"
  );

  // Update the dashboard link for admin
  const processedGroups = filteredGroups.map((group) => {
    if (group.title === "Overview" && role === "ADMIN") {
      return {
        ...group,
        items: [
          { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        ],
      };
    }
    return group;
  });

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">H</span>
        </div>
        {!collapsed && (
          <span className="ml-3 font-bold text-lg text-sidebar-primary truncate">
            HamroClient
          </span>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {processedGroups.map((group) => (
          <div key={group.title} className="mb-1">
            {/* Group Header */}
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              >
                {group.title}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    expandedGroups[group.title] ? "" : "-rotate-90"
                  }`}
                />
              </button>
            )}

            {/* Group Items */}
            {(collapsed || expandedGroups[group.title]) && (
              <div className={collapsed ? "space-y-1 mt-1" : "space-y-0.5"}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center gap-3 rounded-lg transition-colors ${
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "px-3 py-2"
                      } ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className={`shrink-0 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
                      {!collapsed && (
                        <span className="text-sm truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom: User & Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2 space-y-2 shrink-0">
        {/* User Info */}
        <div
          className={`flex items-center gap-3 rounded-lg bg-muted/30 ${
            collapsed ? "justify-center p-2" : "px-3 py-2.5"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(userName)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {userName}
              </p>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {role}
              </span>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          title={collapsed ? "Sign Out" : undefined}
          className={`flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
            collapsed ? "justify-center p-2" : "px-3 py-2"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
            collapsed ? "justify-center p-2" : "px-3 py-2"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
