'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  MapPin,
  Clock,
  Radio,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Route,
} from 'lucide-react';
import { IncidentStatusBadge, PriorityBadge, DeliveryStatusBadge } from '@/components/StatusBadge';
import { useAppState } from '@/lib/state';
import { INCIDENT_STATUSES, RESPONSE_TEAMS, type Incident, type IncidentStatus } from '@/lib/types';

interface IncidentDetailsProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentDetails({ incident, open, onOpenChange }: IncidentDetailsProps) {
  const { updateIncidentStatus, assignTeam, addNote, resolveIncident, nodes } = useAppState();
  const [noteText, setNoteText] = useState('');
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);

  if (!incident) return null;

  const isCritical = incident.priority === 'Critical';
  const isActive = incident.status !== 'Resolved';
  const routeNodes = incident.routeNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean);

  const handleStatusChange = (status: IncidentStatus) => {
    if (status === 'Resolved' && isCritical && isActive) {
      setShowResolveConfirm(true);
      return;
    }
    updateIncidentStatus(incident.id, status);
    toast.success(`Status updated to "${status}"`, { description: `Incident ${incident.id}` });
  };

  const handleResolve = () => {
    resolveIncident(incident.id);
    setShowResolveConfirm(false);
    toast.success('Incident resolved', { description: `${incident.id} marked as resolved.` });
  };

  const handleAssign = (team: string) => {
    assignTeam(incident.id, team);
    toast.success(team === 'Unassigned' ? 'Team unassigned' : `${team} assigned`, { description: `Incident ${incident.id}` });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote(incident.id, noteText.trim(), 'Operator');
    setNoteText('');
    toast.success('Note added', { description: `Incident ${incident.id}` });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[460px] overflow-y-auto elrn-scroll">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle className="text-[16px] font-mono">{incident.id}</SheetTitle>
              <IncidentStatusBadge status={incident.status} />
            </div>
            <SheetDescription className="text-[13px]">
              {incident.emergencyType} · {incident.locationLabel}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-5">
            {/* Priority and Delivery */}
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={incident.priority} />
              <DeliveryStatusBadge status={incident.deliveryStatus} />
              {incident.reporterId && (
                <span className="text-[11px] text-muted-foreground font-mono">Reporter: {incident.reporterId}</span>
              )}
            </div>

            {/* Description */}
            {incident.description && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                <p className="text-[13px] text-foreground leading-relaxed">{incident.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">Coordinates</div>
                  <div className="font-mono text-[12px]">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">Received</div>
                  <div className="text-[12px]">{new Date(incident.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">Relay Hops</div>
                  <div className="text-[12px]">{incident.relayHops}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">Last Updated</div>
                  <div className="text-[12px]">{new Date(incident.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Route */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Route className="h-3 w-3" /> Message Route (Simulated)
              </p>
              {routeNodes.length > 0 ? (
                <div className="flex items-center flex-wrap gap-1.5">
                  {routeNodes.map((node, idx) => (
                    <div key={node!.id} className="flex items-center gap-1.5">
                      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-mono">
                        {node!.id}
                      </span>
                      {idx < routeNodes.length - 1 && <span className="text-muted-foreground text-[11px]">→</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground">No route available — message pending delivery.</p>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Actions</p>

              <div className="space-y-1.5">
                <Label className="text-[12px]">Change Status</Label>
                <Select value={incident.status} onValueChange={(v) => handleStatusChange(v as IncidentStatus)}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INCIDENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px]">Response Team</Label>
                <Select value={incident.assignedTeam || 'Unassigned'} onValueChange={handleAssign}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESPONSE_TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-[13px] border-success/30 text-success hover:bg-success/5"
                  onClick={() => isCritical ? setShowResolveConfirm(true) : handleResolve()}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Mark as Resolved
                </Button>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Notes ({incident.notes.length})
              </p>
              {incident.notes.length > 0 && (
                <div className="space-y-2">
                  {incident.notes.map((note) => (
                    <div key={note.id} className="rounded-md border border-border bg-muted/30 px-3 py-2">
                      <p className="text-[13px] text-foreground">{note.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {note.author} · {new Date(note.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="text-[13px] min-h-[44px] resize-none"
                />
                <Button size="sm" className="h-9 shrink-0" onClick={handleAddNote} disabled={!noteText.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showResolveConfirm} onOpenChange={setShowResolveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Resolve Critical Incident?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to mark {incident.id} as resolved. This is a Critical priority incident. Please confirm that the situation has been fully addressed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-success hover:bg-success/90" onClick={handleResolve}>
              Confirm Resolve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
