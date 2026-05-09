import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { Search, Loader2, ArrowUpDown, MoreHorizontal, Eye, CheckCircle, XCircle, UserPlus, Trash2, Building } from 'lucide-react';
import { toast } from 'sonner';

import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import CrmLayout from '@/components/CrmLayout.jsx';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';

import ApplicationDetailModal from '@/components/crm/ApplicationDetailModal.jsx';
import SuccessCredentialsModal from '@/components/crm/SuccessCredentialsModal.jsx';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';
import ActionConfirmationDialog from '@/components/ActionConfirmationDialog.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

import SearchHighlight from '@/components/SearchHighlight';
import PaginationInfo from '@/components/PaginationInfo';
import BulkActionsToolbar from '@/components/BulkActionsToolbar';
import BulkDeleteDialog from '@/components/BulkDeleteDialog';
import BulkStatusChangeDialog from '@/components/BulkStatusChangeDialog';
import ExportMenu from '@/components/ExportMenu';
import { exportToCSV, exportToExcel } from '@/lib/ExportUtils';

const STATUS_COLORS = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Approved': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
};

export default function ApprovalWorkflowPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [crmUsers, setCrmUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const itemsPerPage = 20;

  // Selected Item
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Custom Detail/Success Modals
  const [showDetail, setShowDetail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  // Generic Dialogs
  const [actionDialog, setActionDialog] = useState({ isOpen: false, type: '', loading: false });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false });

  // Bulk Dialogs
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appsResponse = await apiServerClient.fetch('/applications/list');
      if (!appsResponse.ok) throw new Error('Failed to fetch applications');
      const appsData = await appsResponse.json();

      const usersData = await pb.collection('crm_users').getFullList({
        filter: 'status = "Active"',
        sort: 'fullName',
        $autoCancel: false
      }).catch(() => []);

      setApplications(appsData);
      setCrmUsers(usersData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applications data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedData = useMemo(() => {
    let result = [...applications];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a => 
        (a.fullName || '').toLowerCase().includes(q) || 
        (a.email || '').toLowerCase().includes(q) || 
        (a.companyName || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(a => a.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      
      if (sortConfig.key === 'createdDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, searchTerm, statusFilter, sortConfig]);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedData.map(a => a.applicationId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const triggerAction = (type, app) => {
    setSelectedApp(app);
    setShowDetail(false);
    setTimeout(() => {
      if (type === 'delete') {
        setDeleteDialog({ isOpen: true, loading: false });
      } else {
        setActionDialog({ isOpen: true, type, loading: false });
      }
    }, 100);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      const response = await apiServerClient.fetch(`/applications/${selectedApp.applicationId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      
      toast.success('Application deleted successfully.');
      setDeleteDialog({ isOpen: false, loading: false });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete application');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmAction = async () => {
    const { type } = actionDialog;
    setActionDialog(prev => ({ ...prev, loading: true }));

    try {
      let endpoint = '';
      let bodyData = {};

      if (type === 'approve') {
        endpoint = `/applications/${selectedApp.applicationId}/approve`;
        bodyData = { accountManager: currentUser?.id }; 
      } else if (type === 'reject') {
        endpoint = `/applications/${selectedApp.applicationId}/reject`;
        bodyData = { rejectionReason: 'Rejected via dashboard workflow' };
      } else if (type === 'assign') {
        endpoint = `/applications/${selectedApp.applicationId}/assign-manager`;
        bodyData = { accountManager: currentUser?.id };
      }

      const response = await apiServerClient.fetch(endpoint, {
        method: type === 'assign' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Action failed');

      setActionDialog({ isOpen: false, type: '', loading: false });
      
      if (type === 'approve') {
        setGeneratedCredentials({
          partnerId: data.partnerId,
          username: data.username,
          password: data.password,
          accountManagerName: currentUser?.name || 'Assigned Manager'
        });
        setTimeout(() => setShowSuccess(true), 100);
      } else {
        toast.success(`Application successfully ${type === 'assign' ? 'updated' : type + 'd'}.`);
      }
      
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Action failed');
      setActionDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const promises = selectedIds.map(id => apiServerClient.fetch(`/applications/${id}`, { method: 'DELETE' }));
      await Promise.all(promises);
      toast.success(`${selectedIds.length} applications deleted successfully`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete some applications');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    setBulkLoading(true);
    try {
      // Note: In a real app, you'd have a bulk endpoint. Here we loop.
      const promises = selectedIds.map(id => {
        if (newStatus === 'Approved') return apiServerClient.fetch(`/applications/${id}/approve`, { method: 'POST', body: JSON.stringify({ accountManager: currentUser?.id }) });
        if (newStatus === 'Rejected') return apiServerClient.fetch(`/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason: 'Bulk update' }) });
        return Promise.resolve(); // Other statuses might need a generic update endpoint
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.length} applications updated successfully`);
      setSelectedIds([]);
      setIsBulkStatusOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update some applications');
    } finally {
      setBulkLoading(false);
    }
  };

  const getActionConfig = () => {
    switch (actionDialog.type) {
      case 'approve':
        return {
          title: "Approve Application?",
          message: "Are you sure you want to approve this application?",
          details: "Approval credentials will be generated and sent to the applicant.",
          color: "#10B981"
        };
      case 'reject':
        return {
          title: "Reject Application?",
          message: "Are you sure you want to reject this application?",
          details: "A rejection email will be sent to the applicant.",
          color: "#EF4444"
        };
      case 'assign':
        return {
          title: "Assign to Yourself?",
          message: "Are you sure you want to assign this partner to yourself?",
          details: "You will become the designated account manager for this partner.",
          color: "#F97316"
        };
      default:
        return { title: "", message: "", details: "", color: "#F97316" };
    }
  };

  const getExportData = () => {
    const dataToExport = selectedIds.length > 0 
      ? applications.filter(a => selectedIds.includes(a.applicationId))
      : processedData;
      
    return dataToExport.map(a => ({
      ID: a.applicationId,
      Name: a.fullName,
      Email: a.email,
      Company: a.companyName,
      Type: a.businessType,
      Status: a.status,
      Date: new Date(a.createdDate).toLocaleDateString()
    }));
  };

  return (
    <CrmLayout title="Partner Applications">
      <Helmet><title>Partner Applications | OxgenieEdge CRM</title></Helmet>

      <div className="bg-card rounded-2xl shadow-sm border border-border flex flex-col h-[calc(100vh-12rem)] pb-20">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10">
          <div className="flex flex-1 w-full sm:max-w-xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search name, email, company..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <ExportMenu 
              onExportCSV={() => exportToCSV(getExportData(), 'applications')}
              onExportExcel={() => exportToExcel(getExportData(), 'applications')}
              totalCount={applications.length}
              filteredCount={processedData.length}
              selectedCount={selectedIds.length}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[120px]">App ID</TableHead>
                <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-1">Applicant <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-1">Company <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('createdDate')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <span className="text-muted-foreground">Loading applications...</span>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="font-medium text-foreground">No applications found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((app) => (
                  <TableRow key={app.applicationId} className="hover:bg-muted/20 transition-colors group">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedIds.includes(app.applicationId)}
                        onCheckedChange={(checked) => handleSelect(app.applicationId, checked)}
                        aria-label={`Select ${app.applicationId}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {app.applicationId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        <SearchHighlight text={app.fullName} searchTerm={searchTerm} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <SearchHighlight text={app.email} searchTerm={searchTerm} />
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <SearchHighlight text={app.companyName || '-'} searchTerm={searchTerm} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {app.businessType}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${STATUS_COLORS[app.status] || STATUS_COLORS['New']} border`}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {app.createdDate ? format(new Date(app.createdDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.accountManager 
                        ? crmUsers.find(u => u.id === app.accountManager)?.fullName || app.accountManager 
                        : <span className="italic opacity-50">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuItem onClick={() => { setSelectedApp(app); setShowDetail(true); }} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {app.status === 'Approved' ? (
                            <DropdownMenuItem onClick={() => triggerAction('assign', app)} className="cursor-pointer text-[#F97316] focus:text-[#F97316]">
                              <UserPlus className="w-4 h-4 mr-2" /> Assign to Me
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => triggerAction('approve', app)} className="cursor-pointer text-[#10B981] focus:text-[#10B981]">
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => triggerAction('reject', app)} className="cursor-pointer text-[#EF4444] focus:text-[#EF4444]">
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => triggerAction('delete', app)} className="cursor-pointer text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
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

        {!loading && processedData.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <PaginationInfo 
              currentPage={currentPage} 
              itemsPerPage={itemsPerPage} 
              totalItems={processedData.length} 
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-border hover:bg-muted">
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-border hover:bg-muted">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <BulkActionsToolbar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onChangeStatus={() => setIsBulkStatusOpen(true)}
      />

      <BulkDeleteDialog 
        isOpen={isBulkDeleteOpen}
        count={selectedIds.length}
        isLoading={bulkLoading}
        onCancel={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <BulkStatusChangeDialog 
        isOpen={isBulkStatusOpen}
        count={selectedIds.length}
        statuses={['New', 'Under Review', 'Approved', 'Rejected']}
        isLoading={bulkLoading}
        onCancel={() => setIsBulkStatusOpen(false)}
        onConfirm={handleBulkStatusChange}
      />

      <ApplicationDetailModal 
        isOpen={showDetail} 
        onClose={() => setShowDetail(false)} 
        applicationId={selectedApp?.applicationId} 
        crmUsers={crmUsers}
        onAction={triggerAction}
      />

      <SuccessCredentialsModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        credentials={generatedCredentials} 
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        itemType="Application"
        itemName={selectedApp?.fullName}
        isLoading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, loading: false })}
      />

      <ActionConfirmationDialog
        isOpen={actionDialog.isOpen}
        action={actionDialog.type}
        title={getActionConfig().title}
        message={getActionConfig().message}
        details={getActionConfig().details}
        confirmButtonColor={getActionConfig().color}
        isLoading={actionDialog.loading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionDialog({ isOpen: false, type: '', loading: false })}
      />

    </CrmLayout>
  );
}