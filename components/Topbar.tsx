'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, RadioTower, Menu, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/lib/state';
import { SosSimulator } from '@/components/SosSimulator';


interface TopbarProps {
  title: string;
  breadcrumb?: string;
  onMobileMenu: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export function Topbar({
  title,
  breadcrumb,
  onMobileMenu,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search incidents or node IDs...',
}: TopbarProps) {
  const { incidents, nodes } = useAppState();
  const [now, setNow] = useState<Date | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved').length;
  const offlineNodes = nodes.filter((n) => n.status === 'Offline').length;
  const notificationCount = activeIncidents + offlineNodes;

  const dateStr = now
    ? now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const timeStr = now
    ? now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 h-[76px] border-b border-border bg-card/95 px-4 lg:px-9 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={onMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 flex-col justify-center">
          {breadcrumb && (
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">{breadcrumb}</span>
          )}
          <h1 className="mt-1 text-[22px] font-medium leading-none tracking-[-0.02em] text-foreground truncate">
            {title}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-[200px] lg:w-[260px] pl-8 text-[13px]"
              />
            </div>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-md border border-border/80 bg-card shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
              onClick={() => setNotifOpen(!notifOpen)}
              onBlur={() => setTimeout(() => setNotifOpen(false), 200)}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 rounded-md border border-border bg-popover shadow-lg z-50">
                <div className="px-3 py-2 border-b border-border text-[12px] font-semibold text-foreground">
                  Notifications
                </div>
                <div className="max-h-64 overflow-y-auto elrn-scroll">
                  {activeIncidents > 0 && (
                    <div className="px-3 py-2 text-[12px] text-muted-foreground border-b border-border">
                      <span className="text-destructive font-medium">{activeIncidents}</span> active incident{activeIncidents !== 1 ? 's' : ''} requiring attention
                    </div>
                  )}
                  {offlineNodes > 0 && (
                    <div className="px-3 py-2 text-[12px] text-muted-foreground border-b border-border">
                      <span className="text-warning font-medium">{offlineNodes}</span> node{offlineNodes !== 1 ? 's' : ''} currently offline
                    </div>
                  )}
                  {notificationCount === 0 && (
                    <div className="px-3 py-2 text-[12px] text-muted-foreground">No active notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-col items-end text-right leading-none">
            <span className="text-[12px] text-muted-foreground">{dateStr}</span>
            <span className="text-[11px] text-muted-foreground/70 mt-1 font-mono">{timeStr}</span>
          </div>

          <Badge variant="outline" className="hidden items-center gap-1 rounded-md border-success/25 bg-success/5 py-1 text-[11px] text-success sm:inline-flex">
            <RadioTower className="h-3 w-3" />
            Operational
          </Badge>

          <Button
            size="sm"
            className="h-9 rounded-md bg-destructive px-3 text-[13px] font-medium shadow-sm transition-all hover:-translate-y-px hover:bg-destructive/90 hover:shadow-md"
            onClick={() => setSosOpen(true)}
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Simulate SOS
          </Button>
        </div>
      </header>
      <div className="flex h-8 items-center justify-between border-b border-border bg-muted/20 px-4 lg:px-9 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Simulation services operational</span>
        <span className="hidden sm:inline">Last sync: just now</span>
      </div>

      <SosSimulator open={sosOpen} onOpenChange={setSosOpen} />
    </>
  );
}
