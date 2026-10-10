'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import IncidentMap, { type MapFilters } from '@/components/IncidentMapClient';
import { IncidentDetails } from '@/components/IncidentDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '@/lib/state';
import type { Incident, IncidentStatus, EmergencyType } from '@/lib/types';

export default function MapPage() {
  const { incidents, nodes, hydrated } = useAppState();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    showIncidents: true,
    showNodes: true,
    statusFilter: 'All',
    typeFilter: 'All',
  });

  const handleViewIncident = (id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (inc) {
      setSelectedIncident(inc);
      setDetailsOpen(true);
    }
  };

  return (
    <AppShell title="Map View" breadcrumb="Geographic Overview — Indore, Madhya Pradesh">
      {!hydrated ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <div className="mb-3 text-[12px] text-muted-foreground">
            Interactive map showing incident markers and network node positions. Click any marker for details. Use the filter controls to toggle layers.
          </div>
          <IncidentMap
            incidents={incidents}
            nodes={nodes}
            filters={filters}
            height="calc(100vh - 200px)"
            onIncidentClick={handleViewIncident}
          />

          <IncidentDetails
            incident={selectedIncident}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />
        </>
      )}
    </AppShell>
  );
}
