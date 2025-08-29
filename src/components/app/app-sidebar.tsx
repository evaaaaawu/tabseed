"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Inbox, LayoutDashboard, BookMarked, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const STORAGE_KEY = "tabseed.sidebar.collapsed";

export function AppSidebar(): JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        setCollapsed(raw === "1");
      } else if (typeof window !== "undefined") {
        const prefersNarrow = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
        setCollapsed(prefersNarrow);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const NavItem = (
    props: {
      href: string;
      label: string;
      icon: React.ReactNode;
      active: boolean;
    }
  ): JSX.Element => {
    return (
      <Link
        href={props.href}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          props.active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
        aria-current={props.active ? "page" : undefined}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">{props.icon}</span>
        {!collapsed && <span className="truncate">{props.label}</span>}
      </Link>
    );
  } as any;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-card/70 backdrop-blur",
        collapsed ? "w-[56px]" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && <span className="text-sm font-medium">TabSeed</span>}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-2">
        <NavItem
          href="/inbox"
          label="Inbox"
          icon={<Inbox className="h-5 w-5" />}
          active={pathname?.startsWith("/inbox") ?? false}
        />
        <NavItem
          href="/kanban"
          label="Kanban"
          icon={<LayoutDashboard className="h-5 w-5" />}
          active={pathname?.startsWith("/kanban") ?? false}
        />
        <NavItem
          href="/library"
          label="Library"
          icon={<BookMarked className="h-5 w-5" />}
          active={pathname?.startsWith("/library") ?? false}
        />
      </nav>
      <div className="p-2 text-xs text-muted-foreground">
        {!collapsed && <p className="px-1">v0.1.0</p>}
      </div>
    </aside>
  );
}


