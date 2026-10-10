'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@/lib/types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Radio,
  Server,
  UserCog,
  FileText,
  RotateCcw,
  Inbox,
} from 'lucide-react';

const eventIcons: Record<string, typeof AlertTriangle> = {
  'SOS Created': AlertTriangle,
  'Message Received': Radio,
  'Message Forwarded': ArrowRight,
  'Gateway Delivery': Server,
  'Incident Acknowledged': CheckCircle2,
  'Response Team Assigned': UserCog,
  'Incident Resolved': CheckCircle2,
  'Node Status Changed': Server,
  'Incident Note Added': FileText,
  'Demo Reset': RotateCcw,
};

const eventColors: Record<string, string> = {
  'SOS Created': 'text-destructive',
  'Message Received': 'text-primary',
  'Message Forwarded': 'text-primary',
  'Gateway Delivery': 'text-primary',
  'Incident Acknowledged': 'text-warning',
  'Response Team Assigned': 'text-primary',
  'Incident Resolved': 'text-success',
  'Node Status Changed': 'text-warning',
  'Incident Note Added': 'text-muted-foreground',
  'Demo Reset': 'text-muted-foreground',
};

interface ActivityFeedProps {
  logs: ActivityLog[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function ActivityFeed({ logs, maxItems = 12, showViewAll, onViewAll }: ActivityFeedProps) {
  const displayLogs = logs.slice(0, maxItems);

  if (displayLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Inbox className="h-6 w-6 text-muted-foreground/40 mb-2" />
        <p className="text-[13px] text-muted-foreground">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <ScrollArea className="max-h-[420px] elrn-scroll pr-3">
        <div className="space-y-0">
          {displayLogs.map((log, idx) => {
            const Icon = eventIcons[log.eventType] || AlertTriangle;
            const color = eventColors[log.eventType] || 'text-muted-foreground';
            return (
              <div
                key={log.id}
                className={cn(
                  'flex items-start gap-3 py-2.5',
                  idx < displayLogs.length - 1 && 'border-b border-border/50'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon className={cn('h-3.5 w-3.5', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground leading-snug">{log.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{log.eventType}</span>
                    {log.relatedEntityId && (
                      <span className="text-[11px] text-muted-foreground font-mono">· {log.relatedEntityId}</span>
                    )}
                    <span className="text-[11px] text-muted-foreground/70 ml-auto whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {showViewAll && onViewAll && logs.length > maxItems && (
        <button
          onClick={onViewAll}
          className="mt-3 w-full rounded-md border border-border py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          View all {logs.length} entries
        </button>
      )}
    </div>
  );
}
