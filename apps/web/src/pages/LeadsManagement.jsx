
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Download, Plus, MoreHorizontal, UserPlus, 
  Trash, Filter, FileEdit, Users, Loader2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { fetchLeadsWithFilters, exportLeadsToCSV, updateLeadStatus, deleteLead } from '@/api/adminApi';
import LeadDetailsModal from '@/components/LeadDetailsModal';
import BulkAssignModal from '@/components/BulkAssignModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Table State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Selection & Actions
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedLeadIdForDetails, setSelectedLeadIdForDetails] = useState(null);
  
  // Modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeadsWithFilters(page, limit, {
        search: debouncedSearch,
        source: sourceFilter,
        status: statusFilter
      });
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, sourceFilter, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  // Actions
  const handleExportCSV = () => {
    exportLeadsToCSV(leads);
    toast.success('Export started');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLeadStatus(id, newStatus);
      toast.success('Status updated');
      loadLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      if (leadToDelete) {
        await deleteLead(leadToDelete.id);
        toast.success('Lead deleted');
      } else if (selectedLeads.length > 0) {
        await Promise.all(selectedLeads.map(id => deleteLead(id)));
        toast.success(`${selectedLeads.length} leads deleted`);
        setSelectedLeads([]);
      }
      loadLeads();
    } catch (err) {
      toast.error('Failed to delete leads');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View, track, and manage your incoming leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} disabled={leads.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Lead
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex-1 flex items-center gap-3 w-full">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name, email, or phone..." 
                  className="pl-9 bg-background text-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px] bg-background text-foreground">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sources</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-background text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="New Lead">New Lead</SelectItem>
                  <SelectItem value="Attempted Contact">Attempted Contact</SelectItem>
                  <SelectItem value="Connected">Connected</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions Banner */}
          {selectedLeads.length > 0 && (
            <div className="bg-primary/10 text-primary px-4 py-3 flex items-center justify-between border-b border-primary/20 animate-in slide-in-from-top-2">
              <span className="text-sm font-medium">{selectedLeads.length} leads selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setIsBulkAssignOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Assign Selected
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setLeadToDelete(null); setIsDeleteDialogOpen(true); }}>
                  <Trash className="h-4 w-4 mr-2" /> Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={leads.length > 0 && selectedLeads.length === leads.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Lead Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                        <Users className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-lg font-medium text-foreground">No leads found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} className="group cursor-pointer transition-colors hover:bg-muted/50">
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                          aria-label={`Select ${lead.name}`}
                        />
                      </TableCell>
                      <TableCell onClick={() => { setSelectedLeadIdForDetails(lead.id); setIsDetailsOpen(true); }}>
                        <div className="font-medium text-foreground">{lead.name || 'Unnamed Lead'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {lead.assignedTo ? `Assigned to: ${lead.expand?.assignedTo?.name || 'Agent'}` : 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => { setSelectedLeadIdForDetails(lead.id); setIsDetailsOpen(true); }}>
                        <div className="text-sm text-foreground">{lead.email || '—'}</div>
                        <div className="text-xs text-muted-foreground">{lead.mobile || '—'}</div>
                      </TableCell>
                      <TableCell onClick={() => { setSelectedLeadIdForDetails(lead.id); setIsDetailsOpen(true); }}>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                          {lead.source || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select 
                          value={lead.status || 'New Lead'} 
                          onValueChange={(val) => handleStatusChange(lead.id, val)}
                        >
                          <SelectTrigger className="h-8 w-[140px] text-xs bg-background text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New Lead">New Lead</SelectItem>
                            <SelectItem value="Attempted Contact">Attempted Contact</SelectItem>
                            <SelectItem value="Connected">Connected</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Won">Won</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap" onClick={() => { setSelectedLeadIdForDetails(lead.id); setIsDetailsOpen(true); }}>
                        {new Date(lead.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedLeadIdForDetails(lead.id); setIsDetailsOpen(true); }}>
                              <FileEdit className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {!lead.assignedTo && (
                              <DropdownMenuItem onClick={() => { setSelectedLeads([lead.id]); setIsBulkAssignOpen(true); }}>
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Lead
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => { setLeadToDelete(lead); setIsDeleteDialogOpen(true); }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} leads
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <LeadDetailsModal 
        leadId={selectedLeadIdForDetails}
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedLeadIdForDetails(null); }}
        onUpdate={loadLeads}
      />

      <BulkAssignModal 
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedLeads={leads.filter(l => selectedLeads.includes(l.id))}
        onSuccess={() => { setSelectedLeads([]); loadLeads(); }}
      />

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title={leadToDelete ? `Delete ${leadToDelete.name || 'Lead'}` : `Delete ${selectedLeads.length} Leads`}
        description={leadToDelete ? `Are you sure you want to permanently delete this lead?` : `Are you sure you want to permanently delete ${selectedLeads.length} leads?`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default LeadsManagement;
