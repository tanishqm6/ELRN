import { cn } from '@/lib/utils';
import type { IncidentStatus, NodeStatus, Priority, DeliveryStatus } from '@/lib/types';

const incidentStatusStyles: Record<IncidentStatus, string> = {
  New: 'bg-destructive/10 text-destructive border-destructive/20',
  Acknowledged: 'bg-warning/10 text-warning border-warning/20',
  Dispatched: 'bg-primary/10 text-primary border-primary/20',
  'In Progress': 'bg-warning/10 text-warning border-warning/20',
  Resolved: 'bg-success/10 text-success border-success/20',
};

const nodeStatusStyles: Record<NodeStatus, string> = {
  Online: 'bg-success/10 text-success border-success/20',
  Degraded: 'bg-warning/10 text-warning border-warning/20',
  Offline: 'bg-muted text-muted-foreground border-border',
};

const priorityStyles: Record<Priority, string> = {
  Critical: 'bg-destructive/10 text-destructive border-destructive/20',
  High: 'bg-destructive/5 text-destructive/80 border-destructive/15',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-muted text-muted-foreground border-border',
};

const deliveryStatusStyles: Record<DeliveryStatus, string> = {
  'SOS Created': 'bg-muted text-muted-foreground border-border',
  'ESP32 Received': 'bg-primary/10 text-primary border-primary/20',
  'LoRa Relay': 'bg-primary/10 text-primary border-primary/20',
  'Gateway Received': 'bg-primary/10 text-primary border-primary/20',
  'Dashboard Updated': 'bg-success/10 text-success border-success/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        incidentStatusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

export function NodeStatusBadge({ status }: { status: NodeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        nodeStatusStyles[status]
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'Online' && 'bg-success',
          status === 'Degraded' && 'bg-warning',
          status === 'Offline' && 'bg-muted-foreground'
        )}
      />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        deliveryStatusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
