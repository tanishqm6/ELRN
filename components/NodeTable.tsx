'use client';

import { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Eye, MapPin, Battery, Signal, Clock, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { NodeStatusBadge } from '@/components/StatusBadge';
import { useAppState } from '@/lib/state';
import { NODE_TYPES, NODE_STATUSES, type NetworkNode, type NodeStatus, type NodeType } from '@/lib/types';
import Link from 'next/link';

interface NodeTableProps {
  nodes: NetworkNode[];
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  typeFilter?: NodeType | 'All';
  onTypeFilterChange?: (val: NodeType | 'All') => void;
  statusFilter?: NodeStatus | 'All';
  onStatusFilterChange?: (val: NodeStatus | 'All') => void;
}

export function NodeTable({
  nodes,
  searchValue = '',
  onSearchChange,
  typeFilter = 'All',
  onTypeFilterChange,
  statusFilter = 'All',
  onStatusFilterChange,
}: NodeTableProps) {
  const { updateNodeStatus, logs } = useAppState();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<NodeStatus | null>(null);

  const handleView = (node: NetworkNode) => {
    setSelectedNode(node);
    setDetailsOpen(true);
  };

  const handleStatusChange = (node: NetworkNode, status: NodeStatus) => {
    if (status === 'Offline' && node.status !== 'Offline') {
      setSelectedNode(node);
      setPendingStatus(status);
      return;
    }
    applyStatusChange(node, status);
  };

  const applyStatusChange = (node: NetworkNode, status: NodeStatus) => {
    updateNodeStatus(node.id, status);
    toast.success(`Node ${node.id} set to ${status}`);
    if (selectedNode) {
      setSelectedNode({ ...node, status });
    }
  };

  const confirmOffline = () => {
    if (selectedNode && pendingStatus) {
      applyStatusChange(selectedNode, pendingStatus);
      setPendingStatus(null);
    }
  };

  const nodeLogs = selectedNode
    ? logs.filter((l) => l.relatedEntityId === selectedNode.id).slice(0, 8)
    : [];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search node ID or location..."
              className="h-9 w-[200px] pl-8 text-[13px]"
            />
          </div>
        )}
        {onTypeFilterChange && (
          <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as NodeType | 'All')}>
            <SelectTrigger className="h-9 w-[160px] text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {NODE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {onStatusFilterChange && (
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as NodeStatus | 'All')}>
            <SelectTrigger className="h-9 w-[140px] text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {NODE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <span className="ml-auto text-[12px] text-muted-foreground">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[12px] h-9 px-3">Node ID</TableHead>
                <TableHead className="text-[12px] h-9 px-3">Type</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden md:table-cell">Location</TableHead>
                <TableHead className="text-[12px] h-9 px-3">Status</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden sm:table-cell">Battery</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden lg:table-cell">Last Seen</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden sm:table-cell">Messages</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden md:table-cell">Signal</TableHead>
                <TableHead className="text-[12px] h-9 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-[13px] text-muted-foreground py-8">
                    No nodes match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                nodes.map((node) => (
                  <TableRow key={node.id} className="hover:bg-muted/30">
                    <TableCell className="px-3 py-2.5 text-[13px] font-mono font-medium">{node.id}</TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px]">{node.type}</TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px] text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{node.locationLabel}</TableCell>
                    <TableCell className="px-3 py-2.5"><NodeStatusBadge status={node.status} /></TableCell>
                    <TableCell className="px-3 py-2.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${node.batteryLevel < 20 ? 'bg-destructive' : node.batteryLevel < 50 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${node.batteryLevel}%` }}
                          />
                        </div>
                        <span className="text-[12px] text-muted-foreground">{node.batteryLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-[12px] text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {new Date(node.lastSeen).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px] hidden sm:table-cell">{node.messagesRelayed}</TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px] hidden md:table-cell">{node.signalQuality}%</TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => handleView(node)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Node Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] overflow-y-auto elrn-scroll">
          {selectedNode && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-[16px] font-mono">{selectedNode.id}</SheetTitle>
                  <NodeStatusBadge status={selectedNode.status} />
                </div>
                <SheetDescription className="text-[13px]">
                  {selectedNode.type} · {selectedNode.locationLabel}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[11px] text-muted-foreground">Coordinates</div>
                      <div className="font-mono text-[12px]">{selectedNode.latitude.toFixed(4)}, {selectedNode.longitude.toFixed(4)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[11px] text-muted-foreground">Battery (simulated)</div>
                      <div className="text-[12px]">{selectedNode.batteryLevel}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[11px] text-muted-foreground">Signal (simulated)</div>
                      <div className="text-[12px]">{selectedNode.signalQuality}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[11px] text-muted-foreground">Last Seen</div>
                      <div className="text-[12px]">{new Date(selectedNode.lastSeen).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[11px] text-muted-foreground">Messages Relayed</div>
                      <div className="text-[12px]">{selectedNode.messagesRelayed}</div>
                    </div>
                  </div>
                </div>

                {selectedNode.isSimulated && (
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                    Telemetry data is simulated for demonstration purposes.
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Change Status</p>
                  <div className="flex gap-2">
                    {NODE_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedNode, s)}
                        className={`flex-1 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                          selectedNode.status === s
                            ? s === 'Online' ? 'border-success/30 bg-success/5 text-success'
                              : s === 'Degraded' ? 'border-warning/30 bg-warning/5 text-warning'
                              : 'border-border bg-muted text-muted-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {selectedNode.status === 'Offline' && (
                    <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <p className="text-[12px] text-warning">
                        Messages routed through this node may be delayed. The simulator will attempt alternate routes for new SOS messages.
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Message History</p>
                    <Link
                      href="/map"
                      className="text-[12px] text-primary hover:underline flex items-center gap-1"
                      onClick={() => setDetailsOpen(false)}
                    >
                      View on Map <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  {nodeLogs.length > 0 ? (
                    <div className="space-y-1.5">
                      {nodeLogs.map((log) => (
                        <div key={log.id} className="text-[12px] border-b border-border/50 pb-1.5">
                          <span className="text-foreground">{log.description}</span>
                          <span className="text-muted-foreground block text-[11px] mt-0.5">
                            {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-muted-foreground">No message history for this node.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Offline Confirmation */}
      <AlertDialog open={pendingStatus !== null} onOpenChange={(o) => !o && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Set Node Offline?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Marking {selectedNode?.id} as offline will affect message routing. SOS messages that would route through this node will need to find alternate paths or be marked as pending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOffline}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
