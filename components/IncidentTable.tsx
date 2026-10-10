'use client';

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncidentStatusBadge, PriorityBadge } from '@/components/StatusBadge';
import type { Incident, IncidentStatus, EmergencyType, Priority } from '@/lib/types';
import { useState } from 'react';

interface IncidentTableProps {
  incidents: Incident[];
  onViewIncident: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: IncidentStatus | 'All';
  onStatusFilterChange?: (val: IncidentStatus | 'All') => void;
  typeFilter?: EmergencyType | 'All';
  onTypeFilterChange?: (val: EmergencyType | 'All') => void;
  compact?: boolean;
}

type SortField = 'createdAt' | 'priority';
const priorityOrder: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function IncidentTable({
  incidents,
  onViewIncident,
  searchValue = '',
  onSearchChange,
  statusFilter = 'All',
  onStatusFilterChange,
  typeFilter = 'All',
  onTypeFilterChange,
  compact = false,
}: IncidentTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = compact ? 5 : 10;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDesc(!sortDesc);
    else { setSortField(field); setSortDesc(true); }
  };

  const sorted = [...incidents].sort((a, b) => {
    let cmp: number;
    if (sortField === 'createdAt') {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return sortDesc ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 pb-3">
          {onSearchChange && (
            <Input
              value={searchValue}
              onChange={(e) => { onSearchChange(e.target.value); setPage(0); }}
              placeholder="Search by ID or location..."
              className="h-9 w-[180px] text-[13px]"
            />
          )}
          {onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={(v) => { onStatusFilterChange(v as IncidentStatus | 'All'); setPage(0); }}>
              <SelectTrigger className="h-9 w-[140px] text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Dispatched">Dispatched</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          )}
          {onTypeFilterChange && (
            <Select value={typeFilter} onValueChange={(v) => { onTypeFilterChange(v as EmergencyType | 'All'); setPage(0); }}>
              <SelectTrigger className="h-9 w-[150px] text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Trapped">Trapped</SelectItem>
                <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                <SelectItem value="Evacuation">Evacuation</SelectItem>
                <SelectItem value="Food and Water">Food and Water</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
          <span className="ml-auto text-[12px] text-muted-foreground">{sorted.length} incident{sorted.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[12px] h-9 px-3">Incident ID</TableHead>
                <TableHead className="text-[12px] h-9 px-3">Type</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden md:table-cell">Location</TableHead>
                <TableHead className="text-[12px] h-9 px-3">
                  <button onClick={() => toggleSort('priority')} className="flex items-center gap-1 hover:text-foreground">
                    Priority <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden sm:table-cell">
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-foreground">
                    Reported <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-[12px] h-9 px-3">Status</TableHead>
                <TableHead className="text-[12px] h-9 px-3 hidden lg:table-cell">Team</TableHead>
                <TableHead className="text-[12px] h-9 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-[13px] text-muted-foreground py-8">
                    No incidents match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((inc) => (
                  <TableRow key={inc.id} className="hover:bg-muted/30">
                    <TableCell className="px-3 py-2.5 text-[13px] font-mono font-medium">{inc.id}</TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px]">{inc.emergencyType}</TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px] text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{inc.locationLabel}</TableCell>
                    <TableCell className="px-3 py-2.5"><PriorityBadge priority={inc.priority} /></TableCell>
                    <TableCell className="px-3 py-2.5 text-[12px] text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {new Date(inc.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="px-3 py-2.5"><IncidentStatusBadge status={inc.status} /></TableCell>
                    <TableCell className="px-3 py-2.5 text-[13px] hidden lg:table-cell">{inc.assignedTeam || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => onViewIncident(inc.id)}>
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

      {!compact && totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
