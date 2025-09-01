"use client";

import { BookMarked, Inbox, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { cn } from '@/lib/utils';

const STORAGE_KEY = "tabseed.sidebar.collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const extStatus = useExtensionStatus();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) return raw === "1";
      const prefersNarrow = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
      return prefersNarrow;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  interface NavItemProps {
    href: string;
    label: string;
    icon: ReactNode;
    active: boolean;
  }

  const NavItem = (props: NavItemProps) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300} disableHoverableContent>
          <TooltipTrigger asChild>
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
              <span className="inline-flex size-5 items-center justify-center">{props.icon}</span>
              {!collapsed && <span className="truncate">{props.label}</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{props.label}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-card/70 backdrop-blur transition-[width] duration-200 ease-emphasized",
        collapsed ? "w-[56px]" : "w-64"
      )}
      aria-label="Primary"
      role="navigation"
    >
      <div className="flex h-14 items-center justify-between px-3">
        {!collapsed && <span className="text-sm font-medium">TabSeed</span>}
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md border hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>
      {!collapsed && (
        <div className="px-3 mb-2">
          <Badge
            tone={extStatus === 'available' ? 'success' : extStatus === 'unknown' ? 'info' : 'warning'}
            variant="soft"
          >
            {extStatus === 'available'
              ? 'Extension: Available'
              : extStatus === 'unknown'
                ? 'Extension: Detecting'
                : 'Extension: Not detected'}
          </Badge>
        </div>
      )}
      <nav className="flex-1 space-y-1 p-2">
        <NavItem
          href="/inbox"
          label="Inbox"
          icon={<Inbox className="size-5" />}
          active={pathname?.startsWith("/inbox") ?? false}
        />
        <NavItem
          href="/kanban"
          label="Kanban"
          icon={<LayoutDashboard className="size-5" />}
          active={pathname?.startsWith("/kanban") ?? false}
        />
        <NavItem
          href="/library"
          label="Library"
          icon={<BookMarked className="size-5" />}
          active={pathname?.startsWith("/library") ?? false}
        />
      </nav>
      <div className="p-2 text-xs text-muted-foreground">
        {!collapsed && <p className="px-1">v0.1.0</p>}
      </div>
    </aside>
  );
}
