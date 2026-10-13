'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import IncidentMap from '@/components/IncidentMapClient';
import { ActivityFeed } from '@/components/ActivityFeed';
import { IncidentDetails } from '@/components/IncidentDetails';
import { SosSimulator } from '@/components/SosSimulator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  RadioTower,
  MessageSquare,
  Send,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Clock3,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAppState } from '@/lib/state';
import type { Incident } from '@/lib/types';

export default function OverviewPage() {
  const { incidents, nodes, logs, hydrated } = useAppState();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved').length;
  const onlineNodes = nodes.filter((n) => n.status === 'Online').length;
  const totalNodes = nodes.length;
  const messagesRelayed = nodes.reduce((sum, n) => sum + n.messagesRelayed, 0);
  const dispatched = incidents.filter((i) => i.status === 'Dispatched').length;
  const inProgress = incidents.filter((i) => i.status === 'In Progress').length;
  const responseActive = dispatched + inProgress;
  const offlineNodes = nodes.filter((n) => n.status === 'Offline').length;
  const degradedNodes = nodes.filter((n) => n.status === 'Degraded').length;
  const pendingMessages = incidents.filter((i) => i.deliveryStatus === 'Pending').length;

  const handleViewIncident = (id: string) => {
    const incident = incidents.find((item) => item.id === id);
    if (incident) {
      setSelectedIncident(incident);
      setDetailsOpen(true);
    }
  };

  return (
    <AppShell title="Overview" breadcrumb="COMMAND CENTER / DEMO">
      {!hydrated ? (
        <div className="flex items-center justify-center py-20 text-[14px] text-muted-foreground">
          Loading demo data...
        </div>
      ) : (
        <div className="space-y-4">
          <section className="overview-context overflow-hidden rounded-md border border-primary/15 bg-[#eef4fb]">
            <div className="flex min-h-[132px] items-center justify-between gap-6 px-5 py-5">
              <div className="max-w-[690px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Field context / last mile communication</p>
                <p className="mt-3 text-[14px] leading-6 text-[#355273]">
                  When mobile networks fail, nearby ESP32 edge devices capture an SOS and forward it through the strongest available LoRa path to the gateway.
                </p>
                <p className="mt-3 text-[11px] text-[#5d7694]">Illustrative field conditions · Indore response zone</p>
              </div>
              <div className="relative hidden h-[132px] w-[190px] shrink-0 overflow-hidden border-l border-primary/10 bg-[#e4edf7] md:block">
                <img
                  src="https://images.pexels.com/photos/14938295/pexels-photo-14938295.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Illustrative communications tower"
                  className="h-full w-full object-cover grayscale-[20%] opacity-75"
                />
                <div className="absolute inset-0 bg-[#dce8f5]/35 mix-blend-multiply" />
                <span className="absolute bottom-2 left-3 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#4d6784]">Illustrative</span>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning/30 bg-[#fffaf0] px-4 py-2.5">
            <p className="flex items-center gap-2 text-[12px] text-[#76551b]">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <span><strong className="font-semibold">DEMO MODE</strong> — All incidents, node telemetry, and network activity shown here are simulated.</span>
            </p>
            <Button variant="ghost" size="sm" className="h-7 px-1.5 text-[12px] font-medium text-[#76551b] hover:bg-warning/10 hover:text-[#60430f]" onClick={() => setSosOpen(true)}>
              Create simulated SOS <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Active incidents"
              value={activeIncidents}
              detail="Unresolved SOS reports"
              icon={AlertTriangle}
              iconClassName="text-destructive"
              testId="stat-active-incidents"
            />
            <StatCard
              label="Nodes online"
              value={onlineNodes}
              sub={`/ ${totalNodes}`}
              detail="Operational demo nodes"
              icon={RadioTower}
              iconClassName="text-success"
              testId="stat-nodes-online"
            />
            <StatCard
              label="Messages relayed"
              value={messagesRelayed}
              detail="Across the mesh network"
              icon={MessageSquare}
              iconClassName="text-primary"
              testId="stat-messages-relayed"
            />
            <StatCard
              label="Response status"
              value={responseActive}
              detail="Dispatched or in progress"
              icon={Send}
              iconClassName="text-warning"
              testId="stat-response-status"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Situational view</p>
                    <CardTitle className="mt-1.5 text-[16px] font-medium">Incident &amp; network map</CardTitle>
                  </div>
                  <Link href="/map" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                    Open full map <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <IncidentMap
                  incidents={incidents}
                  nodes={nodes}
                  height="460px"
                  onIncidentClick={handleViewIncident}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Most recent</p>
                    <CardTitle className="mt-1.5 text-[16px] font-medium">Recent SOS incidents</CardTitle>
                  </div>
                  <Link href="/incidents" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {incidents.slice(0, 5).map((incident) => (
                    <button
                      key={incident.id}
                      onClick={() => handleViewIncident(incident.id)}
                      className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                    >
                      <span className={`mt-0.5 h-10 w-0.5 shrink-0 rounded-full ${
                        incident.status === 'New' ? 'bg-primary'
                        : incident.status === 'Resolved' ? 'bg-success'
                        : incident.status === 'In Progress' ? 'bg-warning'
                        : 'bg-destructive'
                      }`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[13px] font-semibold text-foreground">{incident.id}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            incident.status === 'Resolved' ? 'bg-success/10 text-success'
                            : incident.status === 'In Progress' ? 'bg-warning/10 text-warning'
                            : 'bg-primary/10 text-primary'
                          }`}>{incident.status}</span>
                        </span>
                        <span className="mt-1 block truncate text-[12px] text-muted-foreground">{incident.emergencyType} · {incident.locationLabel}</span>
                        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                          <Clock3 className="h-3 w-3" />
                          {new Date(incident.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                  {incidents.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No incidents recorded.</p>}
                </div>
              </CardContent>
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Network health</p>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <div><p className="font-semibold text-success">{onlineNodes}</p><p className="text-muted-foreground">online</p></div>
                  <div><p className="font-semibold text-warning">{degradedNodes}</p><p className="text-muted-foreground">attention</p></div>
                  <div><p className="font-semibold text-muted-foreground">{pendingMessages}</p><p className="text-muted-foreground">pending</p></div>
                  <div><p className="font-medium text-muted-foreground">{offlineNodes}</p><p className="text-muted-foreground">offline</p></div>
                </div>
              </div>
            </Card>
          </section>

          <Card>
            <CardHeader className="px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-medium">Recent network activity</CardTitle>
                <Link href="/logs" className="text-[12px] font-medium text-primary hover:underline">Open logs</Link>
              </div>
            </CardHeader>
            <CardContent className="border-t border-border px-4 pt-1">
              <ActivityFeed logs={logs} maxItems={4} />
            </CardContent>
          </Card>

          <IncidentDetails incident={selectedIncident} open={detailsOpen} onOpenChange={setDetailsOpen} />
          <SosSimulator open={sosOpen} onOpenChange={setSosOpen} />
        </div>
      )}
    </AppShell>
  );
}
