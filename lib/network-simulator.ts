import type { Incident, NetworkNode, DeliveryStatus } from './types';

const DELIVERY_STAGES: DeliveryStatus[] = [
  'SOS Created',
  'ESP32 Received',
  'LoRa Relay',
  'Gateway Received',
  'Dashboard Updated',
];

export function getDeliveryStages(): DeliveryStatus[] {
  return [...DELIVERY_STAGES];
}

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface SimulatedRoute {
  nodeIds: string[];
  hops: number;
  delivered: boolean;
  pendingReason: string | null;
  stages: { status: DeliveryStatus; nodeId: string | null; reached: boolean }[];
}

export function simulateRoute(
  incident: Pick<Incident, 'latitude' | 'longitude'>,
  nodes: NetworkNode[]
): SimulatedRoute {
  const onlineNodes = nodes.filter((n) => n.status !== 'Offline');

  const edgeNodes = onlineNodes.filter((n) => n.type === 'ESP32 Edge Node');
  const relayNodes = onlineNodes.filter((n) => n.type === 'LoRa Relay Node');
  const gateways = onlineNodes.filter((n) => n.type === 'Gateway Node');

  if (edgeNodes.length === 0) {
    return {
      nodeIds: [],
      hops: 0,
      delivered: false,
      pendingReason:
        'No online ESP32 edge nodes available to receive the SOS signal.',
      stages: DELIVERY_STAGES.map((s) => ({
        status: s,
        nodeId: null,
        reached: s === 'SOS Created',
      })),
    };
  }

  const nearestEdge = edgeNodes.reduce((closest, node) => {
    const d = haversine(incident.latitude, incident.longitude, node.latitude, node.longitude);
    return d < haversine(incident.latitude, incident.longitude, closest.latitude, closest.longitude)
      ? node
      : closest;
  });

  if (relayNodes.length === 0 || gateways.length === 0) {
    return {
      nodeIds: [nearestEdge.id],
      hops: 1,
      delivered: false,
      pendingReason:
        relayNodes.length === 0
          ? 'No online LoRa relay nodes available to forward the message.'
          : 'No online gateway node available to deliver the message to the dashboard.',
      stages: DELIVERY_STAGES.map((s) => ({
        status: s,
        nodeId: s === 'SOS Created' ? null : s === 'ESP32 Received' ? nearestEdge.id : null,
        reached: s === 'SOS Created' || s === 'ESP32 Received',
      })),
    };
  }

  const nearestRelay = relayNodes.reduce((closest, node) => {
    const d = haversine(nearestEdge.latitude, nearestEdge.longitude, node.latitude, node.longitude);
    return d < haversine(nearestEdge.latitude, nearestEdge.longitude, closest.latitude, closest.longitude)
      ? node
      : closest;
  });

  const nearestGateway = gateways.reduce((closest, node) => {
    const d = haversine(nearestRelay.latitude, nearestRelay.longitude, node.latitude, node.longitude);
    return d < haversine(nearestRelay.latitude, nearestRelay.longitude, closest.latitude, closest.longitude)
      ? node
      : closest;
  });

  const nodeIds = [nearestEdge.id, nearestRelay.id, nearestGateway.id];

  return {
    nodeIds,
    hops: 3,
    delivered: true,
    pendingReason: null,
    stages: [
      { status: 'SOS Created', nodeId: null, reached: true },
      { status: 'ESP32 Received', nodeId: nearestEdge.id, reached: true },
      { status: 'LoRa Relay', nodeId: nearestRelay.id, reached: true },
      { status: 'Gateway Received', nodeId: nearestGateway.id, reached: true },
      { status: 'Dashboard Updated', nodeId: nearestGateway.id, reached: true },
    ],
  };
}

export function generateIncidentId(existing: Incident[]): string {
  const maxNum = existing.reduce((max, inc) => {
    const match = inc.id.match(/ELRN-(\d+)/);
    if (match) {
      return Math.max(max, parseInt(match[1], 10));
    }
    return max;
  }, 0);
  return `ELRN-${String(maxNum + 1).padStart(3, '0')}`;
}

export function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
