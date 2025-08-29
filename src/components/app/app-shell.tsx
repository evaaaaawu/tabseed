"use client";

import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}


