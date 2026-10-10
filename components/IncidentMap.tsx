'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident, NetworkNode, IncidentStatus, DeliveryStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { IncidentStatusBadge, PriorityBadge, NodeStatusBadge } from '@/components/StatusBadge';

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function makeIncidentIcon(status: IncidentStatus, priority: string) {
  let cls = 'elrn-marker';
  if (status === 'New' || status === 'Acknowledged') cls += ' elrn-marker-incident-critical';
  else if (status === 'Dispatched' || status === 'In Progress') cls += ' elrn-marker-incident-progress';
  else cls += ' elrn-marker-incident-resolved';
  if (priority === 'Critical' && status !== 'Resolved') cls += ' elrn-marker-pulse';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function makeNodeIcon(status: string) {
  let cls = 'elrn-marker elrn-marker-node';
  if (status === 'Degraded') cls += ' elrn-marker-node-degraded';
  else if (status === 'Offline') cls += ' elrn-marker-node-offline';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
}

function FitBounds({
  incidents,
  nodes,
  showIncidents,
  showNodes,
  trigger,
}: {
  incidents: Incident[];
  nodes: NetworkNode[];
  showIncidents: boolean;
  showNodes: boolean;
  trigger: number;
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    if (showIncidents) incidents.forEach((i) => points.push([i.latitude, i.longitude]));
    if (showNodes) nodes.forEach((n) => points.push([n.latitude, n.longitude]));
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [trigger, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export interface MapFilters {
  showIncidents: boolean;
  showNodes: boolean;
  statusFilter: IncidentStatus | 'All';
  typeFilter: string | 'All';
}

export interface IncidentMapProps {
  incidents: Incident[];
  nodes: NetworkNode[];
  filters?: MapFilters;
  height?: string;
  showControls?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onIncidentClick?: (incidentId: string) => void;
}

const DEFAULT_CENTER: [number, number] = [22.7196, 75.8577];
const DEFAULT_ZOOM = 13;

export function IncidentMap({
  incidents,
  nodes,
  filters = { showIncidents: true, showNodes: true, statusFilter: 'All', typeFilter: 'All' },
  height = '400px',
  showControls = true,
  onNodeClick,
  onIncidentClick,
}: IncidentMapProps) {
  const [mounted, setMounted] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [localFilters, setLocalFilters] = useState<MapFilters>(filters);
  const [fitTrigger, setFitTrigger] = useState(0);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  const filteredIncidents = incidents.filter((i) => {
    if (localFilters.statusFilter !== 'All' && i.status !== localFilters.statusFilter) return false;
    if (localFilters.typeFilter !== 'All' && i.emergencyType !== localFilters.typeFilter) return false;
    return true;
  });

  const visibleNodes = localFilters.showNodes ? nodes : [];
  const visibleIncidents = localFilters.showIncidents ? filteredIncidents : [];

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {showControls && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          <button
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors',
              localFilters.showIncidents
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setLocalFilters({ ...localFilters, showIncidents: !localFilters.showIncidents })}
          >
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Incidents
          </button>
          <button
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors',
              localFilters.showNodes
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setLocalFilters({ ...localFilters, showNodes: !localFilters.showNodes })}
          >
            <span className="h-2 w-2 rounded-sm bg-primary" />
            Nodes
          </button>
          <select
            className="h-7 rounded-md border border-border bg-card px-2 text-[12px] text-foreground"
            value={localFilters.statusFilter}
            onChange={(e) => setLocalFilters({ ...localFilters, statusFilter: e.target.value as IncidentStatus | 'All' })}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Dispatched">Dispatched</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            className="h-7 rounded-md border border-border bg-card px-2 text-[12px] text-foreground"
            value={localFilters.typeFilter}
            onChange={(e) => setLocalFilters({ ...localFilters, typeFilter: e.target.value })}
          >
            <option value="All">All Types</option>
            <option value="Trapped">Trapped</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Evacuation">Evacuation</option>
            <option value="Food and Water">Food and Water</option>
            <option value="Other">Other</option>
          </select>
          <button
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setFitTrigger((t) => t + 1)}
          >
            Fit All
          </button>
        </div>
      )}

      <div className="relative" style={{ height }}>
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-[13px] text-muted-foreground">Loading map...</span>
          </div>
        ) : tileError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-6 text-center">
            <span className="text-[14px] font-medium text-foreground">Map tiles unavailable</span>
            <span className="text-[12px] text-muted-foreground mt-1">
              The OpenStreetMap tiles could not be loaded. This may be due to network restrictions in your environment.
            </span>
          </div>
        ) : (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              eventHandlers={{
                tileerror: () => setTileError(true),
              }}
            />
            <FitBounds
              incidents={visibleIncidents}
              nodes={visibleNodes}
              showIncidents={localFilters.showIncidents}
              showNodes={localFilters.showNodes}
              trigger={fitTrigger}
            />
            {visibleIncidents.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={makeIncidentIcon(inc.status, inc.priority)}
                eventHandlers={{ click: () => onIncidentClick?.(inc.id) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] font-semibold text-foreground">{inc.id}</span>
                      <IncidentStatusBadge status={inc.status} />
                    </div>
                    <div className="space-y-1 text-[12px]">
                      <div><span className="text-muted-foreground">Type:</span> {inc.emergencyType}</div>
                      <div><span className="text-muted-foreground">Location:</span> {inc.locationLabel}</div>
                      <div><span className="text-muted-foreground">Received:</span> {new Date(inc.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      <div><span className="text-muted-foreground">Priority:</span> <span className="inline-block mt-0.5"><PriorityBadge priority={inc.priority} /></span></div>
                      <div><span className="text-muted-foreground">Relay Hops:</span> {inc.relayHops}</div>
                      {inc.assignedTeam && <div><span className="text-muted-foreground">Team:</span> {inc.assignedTeam}</div>}
                      <div><span className="text-muted-foreground">Delivery:</span> {inc.deliveryStatus}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {visibleNodes.map((node) => (
              <Marker
                key={node.id}
                position={[node.latitude, node.longitude]}
                icon={makeNodeIcon(node.status)}
                eventHandlers={{ click: () => onNodeClick?.(node.id) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] font-semibold text-foreground">{node.id}</span>
                      <NodeStatusBadge status={node.status} />
                    </div>
                    <div className="space-y-1 text-[12px]">
                      <div><span className="text-muted-foreground">Type:</span> {node.type}</div>
                      <div><span className="text-muted-foreground">Location:</span> {node.locationLabel}</div>
                      <div><span className="text-muted-foreground">Battery:</span> {node.batteryLevel}% (simulated)</div>
                      <div><span className="text-muted-foreground">Last Seen:</span> {new Date(node.lastSeen).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      <div><span className="text-muted-foreground">Messages:</span> {node.messagesRelayed}</div>
                      <div><span className="text-muted-foreground">Signal:</span> {node.signalQuality}% (simulated)</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {showControls && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-3 py-2.5 text-[11px]">
          <span className="font-medium text-muted-foreground">Legend:</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Active SOS</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> In Progress</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Resolved</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Network Node</span>
        </div>
      )}
    </div>
  );
}
