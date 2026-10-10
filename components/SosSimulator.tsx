'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Radio, ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useAppState } from '@/lib/state';
import { EMERGENCY_TYPES, PRIORITIES, SAMPLE_LOCATIONS, type EmergencyType, type Priority, type DeliveryStatus } from '@/lib/types';
import { getDeliveryStages, type SimulatedRoute } from '@/lib/network-simulator';
import { cn } from '@/lib/utils';

interface SosSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = 'form' | 'progress' | 'result';

export function SosSimulator({ open, onOpenChange }: SosSimulatorProps) {
  const { createIncident, nodes } = useAppState();
  const [phase, setPhase] = useState<Phase>('form');
  const [progressStep, setProgressStep] = useState(0);
  const [route, setRoute] = useState<SimulatedRoute | null>(null);
  const [incidentId, setIncidentId] = useState('');

  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Medical Emergency');
  const [priority, setPriority] = useState<Priority>('High');
  const [locationMode, setLocationMode] = useState<'sample' | 'manual'>('sample');
  const [sampleIdx, setSampleIdx] = useState(0);
  const [lat, setLat] = useState(String(SAMPLE_LOCATIONS[0].lat));
  const [lng, setLng] = useState(String(SAMPLE_LOCATIONS[0].lng));
  const [locationLabel, setLocationLabel] = useState(SAMPLE_LOCATIONS[0].label);
  const [description, setDescription] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [latError, setLatError] = useState('');
  const [lngError, setLngError] = useState('');

  const stages = getDeliveryStages();

  useEffect(() => {
    if (open) {
      setPhase('form');
      setProgressStep(0);
      setRoute(null);
    }
  }, [open]);

  const validateCoords = (): boolean => {
    let valid = true;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setLatError('Latitude must be between -90 and 90');
      valid = false;
    } else setLatError('');
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setLngError('Longitude must be between -180 and 180');
      valid = false;
    } else setLngError('');
    return valid;
  };

  const handleSubmit = () => {
    if (locationMode === 'manual' && !validateCoords()) return;
    if (locationMode === 'sample' && !validateCoords()) {
      setLat(String(SAMPLE_LOCATIONS[sampleIdx].lat));
      setLng(String(SAMPLE_LOCATIONS[sampleIdx].lng));
    }

    const finalLat = parseFloat(lat);
    const finalLng = parseFloat(lng);
    const finalLabel = locationLabel || SAMPLE_LOCATIONS[sampleIdx].label;

    const { incident, route: r } = createIncident({
      emergencyType,
      priority,
      latitude: finalLat,
      longitude: finalLng,
      locationLabel: finalLabel,
      description: description || `${emergencyType} at ${finalLabel}`,
      reporterId: reporterId || null,
    });

    setIncidentId(incident.id);
    setRoute(r);
    setPhase('progress');

    if (r.delivered) {
      stages.forEach((_, idx) => {
        setTimeout(() => setProgressStep(idx + 1), (idx + 1) * 700);
      });
      setTimeout(() => {
        setPhase('result');
        toast.success(`SOS ${incident.id} delivered`, {
          description: `Message routed through ${r.nodeIds.length} nodes to the dashboard.`,
        });
      }, stages.length * 700 + 300);
    } else {
      setProgressStep(1);
      setTimeout(() => {
        setPhase('result');
        toast.warning(`SOS ${incident.id} pending`, {
          description: r.pendingReason || 'Message could not be delivered.',
        });
      }, 1200);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPhase('form');
      setProgressStep(0);
      setRoute(null);
      setDescription('');
      setReporterId('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px]">
            <Radio className="h-4 w-4 text-primary" />
            Simulate SOS Message
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Create a simulated SOS to demonstrate the ELRN message relay workflow. This is not a real radio transmission.
          </DialogDescription>
        </DialogHeader>

        {phase === 'form' && (
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Emergency Type</Label>
                <Select value={emergencyType} onValueChange={(v) => setEmergencyType(v as EmergencyType)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMERGENCY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px]">Location Source</Label>
              <div className="flex gap-2">
                <button
                  className={cn('flex-1 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                    locationMode === 'sample' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}
                  onClick={() => setLocationMode('sample')}
                >
                  Sample Location
                </button>
                <button
                  className={cn('flex-1 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors',
                    locationMode === 'manual' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}
                  onClick={() => setLocationMode('manual')}
                >
                  Manual Coordinates
                </button>
              </div>
            </div>

            {locationMode === 'sample' ? (
              <div className="space-y-1.5">
                <Label className="text-[12px]">Sample Location</Label>
                <Select
                  value={String(sampleIdx)}
                  onValueChange={(v) => {
                    const idx = parseInt(v, 10);
                    setSampleIdx(idx);
                    setLat(String(SAMPLE_LOCATIONS[idx].lat));
                    setLng(String(SAMPLE_LOCATIONS[idx].lng));
                    setLocationLabel(SAMPLE_LOCATIONS[idx].label);
                  }}
                >
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAMPLE_LOCATIONS.map((loc, i) => (
                      <SelectItem key={i} value={String(i)}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Coordinates: {SAMPLE_LOCATIONS[sampleIdx].lat.toFixed(4)}, {SAMPLE_LOCATIONS[sampleIdx].lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Latitude</Label>
                  <Input
                    value={lat}
                    onChange={(e) => { setLat(e.target.value); setLatError(''); }}
                    placeholder="e.g. 22.7196"
                    className="h-9 text-[13px]"
                    type="number"
                    step="0.0001"
                  />
                  {latError && <p className="text-[11px] text-destructive">{latError}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Longitude</Label>
                  <Input
                    value={lng}
                    onChange={(e) => { setLng(e.target.value); setLngError(''); }}
                    placeholder="e.g. 75.8577"
                    className="h-9 text-[13px]"
                    type="number"
                    step="0.0001"
                  />
                  {lngError && <p className="text-[11px] text-destructive">{lngError}</p>}
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[12px]">Location Label</Label>
                  <Input
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="Area name"
                    className="h-9 text-[13px]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[12px]">Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the emergency..."
                className="text-[13px] min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px]">Reporter ID (Optional)</Label>
              <Input
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                placeholder="e.g. RPT-009"
                className="h-9 text-[13px]"
              />
            </div>

            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                The simulation will select a route through available online nodes. If relay or gateway nodes are offline, the message may be marked as pending.
              </p>
            </div>
          </div>
        )}

        {phase === 'progress' && (
          <div className="py-4">
            <p className="text-[13px] font-medium text-foreground mb-1">Simulated Message Journey</p>
            <p className="text-[12px] text-muted-foreground mb-4">
              Tracking SOS {incidentId} through the network — this is a simulated relay, not a real transmission.
            </p>
            <div className="space-y-1">
              {stages.map((stage, idx) => {
                const reached = idx < progressStep;
                const current = idx === progressStep - 1 && route?.delivered;
                const isPending = !route?.delivered && idx === 0;
                return (
                  <div
                    key={stage}
                    className={cn(
                      'flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                      reached ? 'border-success/20 bg-success/5' : 'border-border bg-muted/30',
                      isPending && !reached && 'border-warning/20 bg-warning/5'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold shrink-0',
                      reached ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                    )}>
                      {reached ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-[13px] font-medium', reached ? 'text-foreground' : 'text-muted-foreground')}>
                        {stage}
                      </div>
                      {route && route.stages[idx] && route.stages[idx].nodeId && (
                        <div className="text-[11px] text-muted-foreground">Node: {route.stages[idx].nodeId}</div>
                      )}
                    </div>
                    {idx < stages.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                );
              })}
            </div>
            {!route?.delivered && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <p className="text-[12px] text-warning">{route?.pendingReason}</p>
              </div>
            )}
          </div>
        )}

        {phase === 'result' && (
          <div className="py-4">
            {route?.delivered ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">SOS Delivered Successfully</p>
                    <p className="text-[12px] text-muted-foreground">Incident {incidentId} created and visible on the dashboard.</p>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Incident ID</span><span className="font-medium font-mono">{incidentId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{emergencyType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-medium">{priority}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Relay Hops</span><span className="font-medium">{route.hops}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium font-mono text-[11px]">{route.nodeIds.join(' → ')}</span></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-warning/10 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Message Pending</p>
                    <p className="text-[12px] text-muted-foreground">Incident {incidentId} created but delivery incomplete.</p>
                  </div>
                </div>
                <div className="rounded-md border border-warning/20 bg-warning/5 p-3">
                  <p className="text-[12px] text-warning">{route?.pendingReason}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  The incident has been recorded and will appear in the dashboard. Messages will be retried when nodes come back online.
                </p>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {phase === 'form' && (
            <>
              <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
              <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={handleSubmit}>
                <Radio className="h-3.5 w-3.5 mr-1.5" />
                Send SOS
              </Button>
            </>
          )}
          {phase === 'result' && (
            <Button size="sm" onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
