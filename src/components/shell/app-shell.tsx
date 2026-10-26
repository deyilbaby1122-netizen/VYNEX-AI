"use client";

import { EnvBanner, Navbar } from "./navbar";

export function AppShell({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  if (bare) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <EnvBanner />
      <Navbar variant="app" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
