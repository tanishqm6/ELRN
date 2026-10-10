'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { IncidentTable } from '@/components/IncidentTable';
import { IncidentDetails } from '@/components/IncidentDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, AlertTriangle } from 'lucide-react';
import { useAppState } from '@/lib/state';
import { SosSimulator } from '@/components/SosSimulator';
import type { Incident, IncidentStatus, EmergencyType } from '@/lib/types';

export default function IncidentsPage() {
  const { incidents, hydrated } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<EmergencyType | 'All'>('All');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  const filtered = incidents.filter((inc) => {
    if (search) {
      const q = search.toLowerCase();
      if (!inc.id.toLowerCase().includes(q) && !inc.locationLabel.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (typeFilter !== 'All' && inc.emergencyType !== typeFilter) return false;
    return true;
  });

  const handleViewIncident = (id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (inc) {
      setSelectedIncident(inc);
      setDetailsOpen(true);
    }
  };

  return (
    <AppShell
      title="Live Incidents"
      breadcrumb="Incident Management"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by incident ID or location..."
    >
      {!hydrated ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-muted-foreground">
              {filtered.length} of {incidents.length} incidents shown. Click any incident to view details, update status, or assign a team.
            </p>
            <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => setSosOpen(true)}>
              <Radio className="h-3.5 w-3.5 mr-1.5" />
              Simulate SOS
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <IncidentTable
                incidents={filtered}
                onViewIncident={handleViewIncident}
                searchValue={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </CardContent>
          </Card>

          <IncidentDetails
            incident={selectedIncident}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />

          <SosSimulator open={sosOpen} onOpenChange={setSosOpen} />
        </>
      )}
    </AppShell>
  );
}
