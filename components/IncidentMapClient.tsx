'use client';

import dynamic from 'next/dynamic';
import type { IncidentMapProps, MapFilters } from '@/components/IncidentMap';

const IncidentMap = dynamic(
  () => import('@/components/IncidentMap').then((mod) => mod.IncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-md border border-border">
        <span className="text-[13px] text-muted-foreground">Loading map...</span>
      </div>
    ),
  }
) as React.ComponentType<IncidentMapProps>;

export type { MapFilters };
export default IncidentMap;
