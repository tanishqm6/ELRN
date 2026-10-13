'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Radio, LayoutDashboard, AlertTriangle, RadioTower, Map, ScrollText, Settings, Circle } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/incidents', label: 'Live Incidents', icon: AlertTriangle },
  { href: '/nodes', label: 'Network Nodes', icon: RadioTower },
  { href: '/map', label: 'Map View', icon: Map },
  { href: '/logs', label: 'System Logs', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden md:flex flex-col w-[248px] shrink-0 border-r border-border bg-card h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
          <Radio className="h-4 w-4" />
        </div>
        <div className="leading-none">
          <div className="text-[15px] font-semibold text-foreground tracking-tight">ELRN</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Emergency LoRa Rescue Network</div>
        </div>
      </div>

      <div className="mx-3 mt-4 flex items-center justify-between border-b border-border pb-3">
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <Circle className="h-2 w-2 fill-success text-success" /> Demo mode
        </span>
        <span className="text-[10px] text-muted-foreground">Simulated telemetry</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto elrn-scroll">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                router.push(item.href);
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3 space-y-3">
        <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-success">
            <Circle className="h-2 w-2 fill-success text-success" />
            System operational
          </div>
          <p className="mt-1 pl-4 text-[10px] text-muted-foreground">All services simulated</p>
        </div>
        <Link href="/settings" className="block w-full text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground">
          Reset demo data
        </Link>
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">OC</div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-foreground">Ops coordinator</p>
            <p className="text-[10px] text-muted-foreground">Demo workspace</p>
          </div>
          <span className="ml-auto text-muted-foreground">•••</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-[248px] bg-card border-r border-border flex flex-col">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
            <Radio className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-semibold text-foreground tracking-tight">ELRN</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Emergency LoRa Rescue Network</div>
          </div>
        </div>
        <div className="mx-3 mt-4 flex items-center justify-between border-b border-border pb-3">
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <Circle className="h-2 w-2 fill-success text-success" /> Demo mode
          </span>
          <span className="text-[10px] text-muted-foreground">Simulated telemetry</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" onClick={onClose}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  router.push(item.href);
                  onClose();
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[11px]">
            <Circle className="h-2 w-2 fill-success text-success" />
            <span className="text-muted-foreground">System Operational</span>
            <span className="ml-auto inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Demo
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
