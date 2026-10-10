export type EmergencyType =
  | 'Trapped'
  | 'Medical Emergency'
  | 'Evacuation'
  | 'Food and Water'
  | 'Other';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus =
  | 'New'
  | 'Acknowledged'
  | 'Dispatched'
  | 'In Progress'
  | 'Resolved';

export type DeliveryStatus =
  | 'SOS Created'
  | 'ESP32 Received'
  | 'LoRa Relay'
  | 'Gateway Received'
  | 'Dashboard Updated'
  | 'Pending';

export type NodeType = 'ESP32 Edge Node' | 'LoRa Relay Node' | 'Gateway Node';

export type NodeStatus = 'Online' | 'Degraded' | 'Offline';

export type EventType =
  | 'SOS Created'
  | 'Message Received'
  | 'Message Forwarded'
  | 'Gateway Delivery'
  | 'Incident Acknowledged'
  | 'Response Team Assigned'
  | 'Incident Resolved'
  | 'Node Status Changed'
  | 'Incident Note Added'
  | 'Demo Reset';

export interface Incident {
  id: string;
  emergencyType: EmergencyType;
  priority: Priority;
  latitude: number;
  longitude: number;
  locationLabel: string;
  description: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignedTeam: string | null;
  reporterId: string | null;
  relayHops: number;
  deliveryStatus: DeliveryStatus;
  notes: { id: string; text: string; author: string; timestamp: string }[];
  routeNodeIds: string[];
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  latitude: number;
  longitude: number;
  locationLabel: string;
  status: NodeStatus;
  batteryLevel: number;
  lastSeen: string;
  messagesRelayed: number;
  signalQuality: number;
  isSimulated: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  eventType: EventType;
  relatedEntityId: string | null;
  description: string;
}

export interface DemoSettings {
  notificationsEnabled: boolean;
  autoSimulation: boolean;
  defaultMapLat: number;
  defaultMapLng: number;
  defaultMapZoom: number;
}

export interface AppData {
  incidents: Incident[];
  nodes: NetworkNode[];
  logs: ActivityLog[];
  settings: DemoSettings;
}

export const EMERGENCY_TYPES: EmergencyType[] = [
  'Trapped',
  'Medical Emergency',
  'Evacuation',
  'Food and Water',
  'Other',
];

export const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  'New',
  'Acknowledged',
  'Dispatched',
  'In Progress',
  'Resolved',
];

export const NODE_TYPES: NodeType[] = [
  'ESP32 Edge Node',
  'LoRa Relay Node',
  'Gateway Node',
];

export const NODE_STATUSES: NodeStatus[] = ['Online', 'Degraded', 'Offline'];

export const EVENT_TYPES: EventType[] = [
  'SOS Created',
  'Message Received',
  'Message Forwarded',
  'Gateway Delivery',
  'Incident Acknowledged',
  'Response Team Assigned',
  'Incident Resolved',
  'Node Status Changed',
  'Incident Note Added',
  'Demo Reset',
];

export const RESPONSE_TEAMS = [
  'Team Alpha',
  'Team Bravo',
  'Team Charlie',
  'Team Delta',
  'Unassigned',
];

export const SAMPLE_LOCATIONS = [
  { label: 'Vijay Nagar, Indore', lat: 22.7196, lng: 75.8577 },
  { label: 'Rajwada, Indore', lat: 22.7242, lng: 75.8566 },
  { label: 'Palasia, Indore', lat: 22.7176, lng: 75.8731 },
  { label: 'AB Road, Indore', lat: 22.7104, lng: 75.8768 },
  { label: 'Bhawarkua, Indore', lat: 22.7047, lng: 75.8719 },
  { label: 'Sapna Sangeeta, Indore', lat: 22.6938, lng: 75.8823 },
  { label: 'MR 10 Road, Indore', lat: 22.7286, lng: 75.9142 },
  { label: 'Super Corridor, Indore', lat: 22.7405, lng: 75.9523 },
  { label: 'Nehru Nagar, Indore', lat: 22.7051, lng: 75.8531 },
  { label: 'Khandwa Road, Indore', lat: 22.7606, lng: 75.8895 },
];
