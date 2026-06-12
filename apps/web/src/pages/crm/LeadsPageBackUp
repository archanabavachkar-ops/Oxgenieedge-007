
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import { cn } from '@/lib/utils.js';
import { format, subDays } from 'date-fns';
import { 
  Users, UserPlus, ArrowUpDown, ArrowUp, ArrowDown, 
  Eye, Edit, Trash2, RefreshCw, UserCog, Download,
  Search, Calendar as CalendarIcon, FilterX, Plus, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import AssignLeadModal from '@/components/AssignLeadModal.jsx';
import BulkDeleteDialog from '@/components/BulkDeleteDialog.jsx';
import LeadFormModal from '@/components/crm/LeadFormModal.jsx';
import { exportLeadsToCSV } from '@/lib/ExportUtils.js';
import { motion } from 'framer-motion';

export default function LeadsPage() {
  const { currentAdmin } = useAuth();
  const navigate = useNavigate();
  // We use currentAdmin for CRM, not currentUser (which is public)
  const isAdmin = currentAdmin?.role === 'Admin' || currentAdmin?.role === 'Manager' || currentAdmin?.role === 'CEO';

  const [leads, setLeads] = useState([]);
  const [agentsMap, setAgentsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [dateRange, setDateRange] = useState();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadsToAssign, setLeadsToAssign] = useState([]);
  const [leadToEdit, setLeadToEdit] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const agentsList = await pb.collection('admin_users').getFullList({ $autoCancel: false }).catch(() => []);
      const map = {};
      agentsList.forEach(a => map[a.id] = a);
      setAgentsMap(map);

      const response = await fetch(
        'https://amusing-happiness-production-81e3.up.railway.app/api/leads'
      );

      const result = await response.json();

      console.log('API Leads Response:', result.data);

      if (result.success) {
        setLeads(result.data || []);
      } else {
        console.error('Failed to fetch leads');
        setLeads([]);
      }
    } catch (err) {
      console.error('[LeadsPage] Error fetching leads data:', err);
      setError('Failed to load leads data.');
      toast.error('Could not fetch leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentAdmin) fetchData();
  }, [currentAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, sourceFilter, agentFilter, dateRange]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (lead.name?.toLowerCase().includes(term)) ||
                              (lead.email?.toLowerCase().includes(term)) ||
                              (lead.mobile?.toLowerCase().includes(term)) ||
                              (lead.company?.toLowerCase().includes(term));
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
      if (agentFilter !== 'all') {
        if (agentFilter === 'unassigned' && lead.assignedTo) return false;
        if (agentFilter !== 'unassigned' && lead.assignedTo !== agentFilter) return false;
      }
      if (dateRange?.from) {
        const createdDate = new Date(lead.created);
        if (createdDate < dateRange.from) return false;
        const end = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
        end.setHours(23, 59, 59, 999);
        if (createdDate > end) return false;
      }
      return true;
    });
  }, [leads, searchTerm, statusFilter, priorityFilter, sourceFilter, agentFilter, dateRange]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedLeads = useMemo(() => {
    const sortableItems = [...filteredLeads];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'assignedTo') {
          aVal = agentsMap[aVal]?.fullName || 'Unassigned';
          bVal = agentsMap[bVal]?.fullName || 'Unassigned';
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredLeads, sortConfig, agentsMap]);

  const totalPages = Math.ceil(sortedLeads.length / pageSize);
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const metrics = useMemo(() => {
    if (!leads.length) return { total: 0, new24h: 0 };
    const yesterday = subDays(new Date(), 1);
    let new24h = 0;
    leads.forEach(lead => {
      if (new Date(lead.created) >= yesterday) new24h++;
    });
    return { total: leads.length, new24h };
  }, [leads]);

  const visibleIds = paginatedLeads.map(l => l.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedLeadIds.has(id));
  const someVisibleSelected = visibleIds.length > 0 && visibleIds.some(id => selectedLeadIds.has(id));
  const headerCheckboxState = allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false;

  const handleSelectAll = (checked) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach(id => next.add(id));
      else visibleIds.forEach(id => next.delete(id));
      return next;
    });
  };

  const handleSelectRow = (id, checked) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedLeadIds(new Set());
  const clearFilters = () => {
    setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); setSourceFilter('all'); setAgentFilter('all'); setDateRange(undefined);
  };
  const activeFilterCount = (searchTerm ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0) + (sourceFilter !== 'all' ? 1 : 0) + (agentFilter !== 'all' ? 1 : 0) + (dateRange?.from ? 1 : 0);

  const openAssignModal = (leadsToProcess) => {
    if (!isAdmin) return toast.error('Only administrators can assign leads.');
    setLeadsToAssign(leadsToProcess);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return toast.error('Only administrators can delete leads');
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await pb.collection('leads').delete(id, { $autoCancel: false });
        setLeads(leads.filter(l => l.id !== id));
        setSelectedLeadIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        toast.success('Lead deleted successfully');
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('new')) return 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20';
    if (s.includes('contact') || s.includes('follow') || s.includes('negotiation') || s.includes('proposal')) return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
    if (s.includes('qualified') || s.includes('won')) return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
    if (s.includes('lost') || s.includes('fail')) return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
    return 'bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]';
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'hot' || p === 'urgent' || p === 'high') return 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30';
    if (p === 'medium') return 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30';
    return 'bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]';
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-[#94A3B8]" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3.5 w-3.5 text-[#FF6B00]" /> : <ArrowDown className="ml-2 h-3.5 w-3.5 text-[#FF6B00]" />;
  };

  return (
    <CRMLayout title={isAdmin ? "Admin Lead Dashboard" : "My Leads Dashboard"}>
      <div className="space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-[16px] bg-gradient-primary flex items-center justify-center text-white glow-primary">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider font-heading">Total Leads</p>
                  {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold text-[#0F172A] font-numbers mt-1">{metrics.total}</h3>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="hover-lift">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-[16px] bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <UserPlus className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider font-heading">New (24h)</p>
                  {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold text-[#0F172A] font-numbers mt-1">{metrics.new24h}</h3>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Leads Table Section */}
        <Card className="flex flex-col">
          <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-t-[20px]">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#0F172A]">Lead Directory</h2>
              <p className="text-[#64748B] text-sm font-medium mt-1">Manage and assign leads to your team.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setLeadToEdit(null); setIsLeadFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
              <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 text-[#0F172A]", isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Filter Bar */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {['New Lead', 'Attempted Contact', 'Connected', 'Qualified', 'Won', 'Lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" onClick={clearFilters} className="text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]">
                    <FilterX className="mr-2 h-4 w-4" /> Clear Filters
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0F172A]">
                  <TableRow className="hover:bg-[#0F172A] border-none">
                    <TableHead className="w-[50px] pl-6 py-4">
                      <Checkbox checked={headerCheckboxState} onCheckedChange={handleSelectAll} className="border-white/30 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]" />
                    </TableHead>
                    <TableHead className="text-white font-semibold cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">Lead Name <SortIcon columnKey="name" /></div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">Contact Info</TableHead>
                    <TableHead className="text-white font-semibold cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                    </TableHead>
                    <TableHead className="text-white font-semibold cursor-pointer" onClick={() => handleSort('priority')}>
                      <div className="flex items-center">Priority <SortIcon columnKey="priority" /></div>
                    </TableHead>
                    <TableHead className="text-white font-semibold cursor-pointer hidden lg:table-cell" onClick={() => handleSort('assignedTo')}>
                      <div className="flex items-center">Assigned To <SortIcon columnKey="assignedTo" /></div>
                    </TableHead>
                    <TableHead className="text-right pr-6 text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#FF6B00] mx-auto" /></TableCell></TableRow>
                  ) : paginatedLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-32 text-center text-[#64748B] font-medium">No leads found.</TableCell></TableRow>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const isSelected = selectedLeadIds.has(lead.id);
                      const assignedAgent = agentsMap[lead.assignedTo];

                      return (
                        <TableRow key={lead.id} className={cn("transition-colors hover:bg-[#F8FAFC] border-b border-[#E2E8F0]", isSelected && "bg-[#FF6B00]/5 hover:bg-[#FF6B00]/10")}>
                          <TableCell className="pl-6">
                            <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectRow(lead.id, checked)} />
                          </TableCell>
                          <TableCell className="font-bold text-[#0F172A]">{lead.name}</TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold text-[#0F172A]">{lead.mobile}</div>
                            <div className="text-xs text-[#64748B] font-medium">{lead.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("border font-bold px-3 py-1 rounded-[8px]", getStatusColor(lead.status))}>{lead.status || 'New'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("border font-bold px-3 py-1 rounded-[8px]", getPriorityColor(lead.priority))}>{lead.priority || 'Medium'}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {assignedAgent ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 border border-[#E2E8F0]"><AvatarFallback className="bg-[#FF6B00]/10 text-[#FF6B00] font-bold text-xs">{assignedAgent.fullName?.charAt(0) || 'A'}</AvatarFallback></Avatar>
                                <span className="text-sm font-semibold text-[#0F172A]">{assignedAgent.fullName || 'Unknown Agent'}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#94A3B8] font-medium italic">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              {isAdmin && (
                                <Button variant="outline" size="sm" onClick={() => openAssignModal([lead])} className="h-8 text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white">Assign</Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => { setLeadToEdit(lead); setIsLeadFormOpen(true); }} className="h-8 w-8 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} className="h-8 w-8 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-[#E2E8F0] bg-white rounded-b-[20px]">
                <div className="text-sm font-medium text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-bold text-[#0F172A]">{Math.min(currentPage * pageSize, sortedLeads.length)}</span> of <span className="font-bold text-[#0F172A]">{sortedLeads.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignLeadModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} selectedLeads={leadsToAssign} onSuccess={() => { fetchData(); clearSelection(); }} />
      <BulkDeleteDialog isOpen={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)} selectedLeadIds={Array.from(selectedLeadIds)} onSuccess={() => { fetchData(); clearSelection(); }} />
      <LeadFormModal isOpen={isLeadFormOpen} onClose={() => setIsLeadFormOpen(false)} lead={leadToEdit} onSuccess={fetchData} />
    </CRMLayout>
  );
}
