'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { ScrollText, Trash2, Search } from 'lucide-react';
import { useAppState } from '@/lib/state';
import { EVENT_TYPES, type EventType } from '@/lib/types';
import { toast } from 'sonner';

export default function LogsPage() {
  const { logs, hydrated, clearAllLogs } = useAppState();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<EventType | 'All'>('All');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = logs.filter((log) => {
    if (search) {
      const q = search.toLowerCase();
      if (!log.description.toLowerCase().includes(q) && !(log.relatedEntityId || '').toLowerCase().includes(q)) return false;
    }
    if (eventFilter !== 'All' && log.eventType !== eventFilter) return false;
    return true;
  });

  const handleClear = () => {
    clearAllLogs();
    setShowClearConfirm(false);
    toast.success('Activity logs cleared');
  };

  return (
    <AppShell
      title="System Logs"
      breadcrumb="Activity History"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search logs..."
    >
      {!hydrated ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description or entity ID..."
                className="h-9 w-[220px] pl-8 text-[13px]"
              />
            </div>
            <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as EventType | 'All')}>
              <SelectTrigger className="h-9 w-[180px] text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Event Types</SelectItem>
                {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="ml-auto text-[12px] text-muted-foreground">{filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}</span>
            <Button variant="outline" size="sm" className="h-9 text-[13px]" onClick={() => setShowClearConfirm(true)} disabled={logs.length === 0}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear Logs
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="rounded-md overflow-hidden">
                <div className="overflow-x-auto max-h-[calc(100vh-240px)] overflow-y-auto elrn-scroll">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-[12px] h-9 px-3 whitespace-nowrap">Timestamp</TableHead>
                        <TableHead className="text-[12px] h-9 px-3">Event Type</TableHead>
                        <TableHead className="text-[12px] h-9 px-3">Entity</TableHead>
                        <TableHead className="text-[12px] h-9 px-3">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-[13px] text-muted-foreground py-12">
                            <ScrollText className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                            No log entries match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((log) => (
                          <TableRow key={log.id} className="hover:bg-muted/30">
                            <TableCell className="px-3 py-2 text-[12px] text-muted-foreground whitespace-nowrap font-mono">
                              {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                log.eventType === 'SOS Created' ? 'border-destructive/20 bg-destructive/5 text-destructive'
                                : log.eventType === 'Incident Resolved' ? 'border-success/20 bg-success/5 text-success'
                                : log.eventType === 'Node Status Changed' ? 'border-warning/20 bg-warning/5 text-warning'
                                : 'border-border bg-muted/40 text-muted-foreground'
                              }`}>
                                {log.eventType}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-[12px] font-mono text-muted-foreground">
                              {log.relatedEntityId || '—'}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-[13px]">{log.description}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Activity Logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {logs.length} log entries. This action cannot be undone. Incidents and node data will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleClear}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </AppShell>
  );
}
