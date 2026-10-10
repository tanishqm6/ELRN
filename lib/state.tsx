'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import type {
  Incident,
  NetworkNode,
  ActivityLog,
  AppData,
  DemoSettings,
  IncidentStatus,
  EventType,
  NodeStatus,
  EmergencyType,
  Priority,
} from './types';
import { loadData, saveData, resetData, clearLogs } from './storage';
import { getDemoData } from './demo-data';
import {
  simulateRoute,
  generateIncidentId,
  generateLogId,
  type SimulatedRoute,
} from './network-simulator';

interface StateContextValue {
  incidents: Incident[];
  nodes: NetworkNode[];
  logs: ActivityLog[];
  settings: DemoSettings;
  hydrated: boolean;

  createIncident: (input: {
    emergencyType: EmergencyType;
    priority: Priority;
    latitude: number;
    longitude: number;
    locationLabel: string;
    description: string;
    reporterId: string | null;
  }) => { incident: Incident; route: SimulatedRoute };

  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  assignTeam: (id: string, team: string) => void;
  addNote: (id: string, text: string, author: string) => void;
  resolveIncident: (id: string) => void;

  updateNodeStatus: (id: string, status: NodeStatus) => void;

  clearAllLogs: () => void;
  resetDemo: () => void;
  updateSettings: (partial: Partial<DemoSettings>) => void;

  addLog: (eventType: EventType, relatedEntityId: string | null, description: string) => void;
}

const StateContext = createContext<StateContextValue | null>(null);

export function useAppState(): StateContextValue {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState must be used within StateProvider');
  return ctx;
}

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => getDemoData());
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setHydrated(true);
  }, []);

  const persist = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      dataRef.current = next;
      saveData(next);
      return next;
    });
  }, []);

  const addLogInternal = useCallback(
    (
      prev: AppData,
      eventType: EventType,
      relatedEntityId: string | null,
      description: string
    ): AppData => {
      const log: ActivityLog = {
        id: generateLogId(),
        timestamp: new Date().toISOString(),
        eventType,
        relatedEntityId,
        description,
      };
      return { ...prev, logs: [log, ...prev.logs] };
    },
    []
  );

  const addLog = useCallback(
    (eventType: EventType, relatedEntityId: string | null, description: string) => {
      persist((prev) => addLogInternal(prev, eventType, relatedEntityId, description));
    },
    [persist, addLogInternal]
  );

  const createIncident = useCallback(
    (input: {
      emergencyType: EmergencyType;
      priority: Priority;
      latitude: number;
      longitude: number;
      locationLabel: string;
      description: string;
      reporterId: string | null;
    }): { incident: Incident; route: SimulatedRoute } => {
      const currentData = dataRef.current;
      const id = generateIncidentId(currentData.incidents);
      const nowIso = new Date().toISOString();

      const route = simulateRoute(
        { latitude: input.latitude, longitude: input.longitude },
        currentData.nodes
      );

      const incident: Incident = {
        id,
        emergencyType: input.emergencyType,
        priority: input.priority,
        latitude: input.latitude,
        longitude: input.longitude,
        locationLabel: input.locationLabel,
        description: input.description,
        status: 'New',
        createdAt: nowIso,
        updatedAt: nowIso,
        assignedTeam: null,
        reporterId: input.reporterId,
        relayHops: route.hops,
        deliveryStatus: route.delivered ? 'Dashboard Updated' : 'Pending',
        notes: [],
        routeNodeIds: route.nodeIds,
      };

      persist((prev) => {
        let next: AppData = {
          ...prev,
          incidents: [incident, ...prev.incidents],
        };

        next = addLogInternal(next, 'SOS Created', id, `SOS ${id} created — ${input.emergencyType} at ${input.locationLabel}.`);

        if (route.delivered && route.nodeIds.length >= 3) {
          const edgeId = route.nodeIds[0];
          const relayId = route.nodeIds[1];
          const gwId = route.nodeIds[2];

          next = addLogInternal(next, 'Message Received', id, `ESP32 node ${edgeId} received SOS signal from ${id}.`);
          next = addLogInternal(next, 'Message Forwarded', id, `Message relayed from ${edgeId} to ${relayId}.`);
          next = addLogInternal(next, 'Message Forwarded', id, `Message relayed from ${relayId} to gateway ${gwId}.`);
          next = addLogInternal(next, 'Gateway Delivery', id, `Gateway ${gwId} delivered incident ${id} to dashboard.`);

          next = {
            ...next,
            nodes: next.nodes.map((n) => {
              if (route.nodeIds.includes(n.id)) {
                return {
                  ...n,
                  messagesRelayed: n.messagesRelayed + 1,
                  lastSeen: new Date().toISOString(),
                };
              }
              return n;
            }),
          };
        } else if (route.pendingReason) {
          next = addLogInternal(next, 'Message Received', id, `SOS ${id} could not complete delivery: ${route.pendingReason}`);
        }

        return next;
      });

      return { incident, route };
    },
    [persist, addLogInternal]
  );

  const updateIncidentStatus = useCallback(
    (id: string, status: IncidentStatus) => {
      persist((prev) => {
        let next: {
          incidents: Incident[];
          nodes: NetworkNode[];
          logs: ActivityLog[];
          settings: DemoSettings;
        } = {
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? { ...inc, status, updatedAt: new Date().toISOString() }
              : inc
          ),
        };

        if (status === 'Acknowledged') {
          next = addLogInternal(next as AppData, 'Incident Acknowledged', id, `Incident ${id} acknowledged.`);
        } else if (status === 'Resolved') {
          next = addLogInternal(next as AppData, 'Incident Resolved', id, `Incident ${id} marked as resolved.`);
        }
        return next as AppData;
      });
    },
    [persist, addLogInternal]
  );

  const assignTeam = useCallback(
    (id: string, team: string) => {
      const teamVal = team === 'Unassigned' ? null : team;
      persist((prev) => {
        let next: AppData = {
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  assignedTeam: teamVal,
                  updatedAt: new Date().toISOString(),
                  status: inc.status === 'New' ? 'Acknowledged' : inc.status,
                }
              : inc
          ),
        };
        next = addLogInternal(next, 'Response Team Assigned', id, `${teamVal ?? 'Unassigned'} assigned to incident ${id}.`);
        return next;
      });
    },
    [persist, addLogInternal]
  );

  const addNote = useCallback(
    (id: string, text: string, author: string) => {
      persist((prev) => {
        let next: AppData = {
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  notes: [
                    ...inc.notes,
                    {
                      id: `note-${Date.now()}`,
                      text,
                      author,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : inc
          ),
        };
        next = addLogInternal(next, 'Incident Note Added', id, `Note added to ${id}: "${text.slice(0, 60)}"`);
        return next;
      });
    },
    [persist, addLogInternal]
  );

  const resolveIncident = useCallback(
    (id: string) => {
      persist((prev) => {
        let next: AppData = {
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  status: 'Resolved' as IncidentStatus,
                  updatedAt: new Date().toISOString(),
                }
              : inc
          ),
        };
        next = addLogInternal(next, 'Incident Resolved', id, `Incident ${id} marked as resolved.`);
        return next;
      });
    },
    [persist, addLogInternal]
  );

  const updateNodeStatus = useCallback(
    (id: string, status: NodeStatus) => {
      persist((prev) => {
        let next: AppData = {
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status,
                  lastSeen: status === 'Offline' ? n.lastSeen : new Date().toISOString(),
                  signalQuality: status === 'Offline' ? 0 : n.signalQuality,
                }
              : n
          ),
        };
        next = addLogInternal(next, 'Node Status Changed', id, `Node ${id} changed to ${status}.`);
        return next;
      });
    },
    [persist, addLogInternal]
  );

  const clearAllLogs = useCallback(() => {
    setData((prev) => {
      const next = clearLogs(prev);
      dataRef.current = next;
      return next;
    });
  }, []);

  const resetDemo = useCallback(() => {
    const demo = resetData();
    setData(demo);
    dataRef.current = demo;
    const resetLog: ActivityLog = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      eventType: 'Demo Reset',
      relatedEntityId: null,
      description: 'Demo data has been reset to its original state.',
    };
    const withLog = { ...demo, logs: [resetLog, ...demo.logs] };
    setData(withLog);
    dataRef.current = withLog;
    saveData(withLog);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<DemoSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }));
    },
    [persist]
  );

  const value: StateContextValue = {
    incidents: data.incidents,
    nodes: data.nodes,
    logs: data.logs,
    settings: data.settings,
    hydrated,
    createIncident,
    updateIncidentStatus,
    assignTeam,
    addNote,
    resolveIncident,
    updateNodeStatus,
    clearAllLogs,
    resetDemo,
    updateSettings,
    addLog,
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}
