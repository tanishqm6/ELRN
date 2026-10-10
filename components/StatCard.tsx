import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  detail?: string;
  icon: LucideIcon;
  iconClassName?: string;
  testId?: string;
}

export function StatCard({ label, value, sub, detail, icon: Icon, iconClassName, testId }: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="rounded-md border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[27px] font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {sub && <span className="text-[13px] text-muted-foreground">{sub}</span>}
      </div>
      {detail && <p className="mt-2 max-w-[150px] text-[11px] leading-[1.35] text-muted-foreground">{detail}</p>}
    </div>
  );
}
