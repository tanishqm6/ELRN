'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { NodeTable } from '@/components/NodeTable';
import { Card, CardContent } from '@/components/ui/card';
import { RadioTower, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useAppState } from '@/lib/state';
import type { NodeType, NodeStatus } from '@/lib/types';

export default function NodesPage() {
  const { nodes, hydrated } = useAppState();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<NodeType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'All'>('All');

  const filtered = nodes.filter((node) => {
    if (search) {
      const q = search.toLowerCase();
      if (!node.id.toLowerCase().includes(q) && !node.locationLabel.toLowerCase().includes(q)) return false;
    }
    if (typeFilter !== 'All' && node.type !== typeFilter) return false;
    if (statusFilter !== 'All' && node.status !== statusFilter) return false;
    return true;
  });

  const online = nodes.filter((n) => n.status === 'Online').length;
  const degraded = nodes.filter((n) => n.status === 'Degraded').length;
  const offline = nodes.filter((n) => n.status === 'Offline').length;

  return (
    <AppShell
      title="Network Nodes"
      breadcrumb="Simulated ELRN Network"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search node ID or location..."
    >
      {!hydrated ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-success" />
                <span className="text-[12px] text-muted-foreground">Online</span>
                <span className="ml-auto text-[18px] font-semibold text-success">{online}</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-[12px] text-muted-foreground">Degraded</span>
                <span className="ml-auto text-[18px] font-semibold text-warning">{degraded}</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">Offline</span>
                <span className="ml-auto text-[18px] font-semibold text-muted-foreground">{offline}</span>
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
            <RadioTower className="h-3.5 w-3.5" />
            All telemetry data (battery, signal, messages) is simulated for demonstration. Changing a node's status affects SOS routing in the simulator.
          </div>

          <Card>
            <CardContent className="p-4">
              <NodeTable
                nodes={filtered}
                searchValue={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
