'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar, MobileNav } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

interface AppShellProps {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export function AppShell({
  title,
  breadcrumb,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          breadcrumb={breadcrumb}
          onMobileMenu={() => setMobileNavOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="flex-1 p-4 lg:px-9 lg:py-5 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
