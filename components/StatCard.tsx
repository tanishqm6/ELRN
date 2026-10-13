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
      className="group rounded-lg border border-border/80 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/70 transition-colors group-hover:bg-primary/10">
          <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
        </span>
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
