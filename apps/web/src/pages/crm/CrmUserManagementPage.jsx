
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Search, Plus, MoreHorizontal, Edit2, Trash2, UserX, UserCheck, 
  Shield, ChevronLeft, ChevronRight, FilterX
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

import CrmLayout from '@/layouts/CRMLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import AddUserModal from '@/components/crm/AddUserModal.jsx';
import EditUserModal from '@/components/crm/EditUserModal.jsx';
import DeleteUserConfirmationDialog from '@/components/crm/DeleteUserConfirmationDialog.jsx';
import DeactivateUserConfirmationDialog from '@/components/crm/DeactivateUserConfirmationDialog.jsx';
import ActivateUserConfirmationDialog from '@/components/crm/ActivateUserConfirmationDialog.jsx';
import BulkRoleChangeDialog from '@/components/crm/BulkRoleChangeDialog.jsx';

import SearchHighlight from '@/components/SearchHighlight.jsx';
import PaginationInfo from '@/components/PaginationInfo.jsx';
import BulkActionsToolbar from '@/components/BulkActionsToolbar.jsx';
import BulkDeleteDialog from '@/components/BulkDeleteDialog.jsx';
import BulkStatusChangeDialog from '@/components/BulkStatusChangeDialog.jsx';
import ExportMenu from '@/components/ExportMenu.jsx';
import { exportToCSV, exportToExcel } from '@/lib/ExportUtils.js';

const CrmUserManagementPage = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const itemsPerPage = 10;

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);
  const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
  
  // Bulk Modals
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('admin_users').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      
      const mappedRecords = records.map(r => ({
        ...r,
        status: r.status || 'Inactive'
      }));
      
      setUsers(mappedRecords);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    let isSubscribed = true;
    
    const subscribe = async () => {
      try {
        await pb.collection('admin_users').subscribe('*', (e) => {
          if (isSubscribed && (e.action === 'create' || e.action === 'update' || e.action === 'delete')) {
            fetchUsers();
          }
        });
      } catch (err) {
        console.warn('Real-time subscription failed:', err);
      }
    };
    subscribe();
    
    return () => {
      isSubscribed = false;
      pb.collection('admin_users').unsubscribe('*').catch(console.warn);
    };
  }, []);

  // Filtering & Sorting
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(query)) || 
        (u.email && u.email.toLowerCase().includes(query))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, roleFilter, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredAndSortedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id, checked) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id]);
    } else {
      setSelectedUserIds(prev => prev.filter(userId => userId !== id));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const promises = selectedUserIds.map(id => pb.collection('admin_users').delete(id, { $autoCancel: false }));
      await Promise.all(promises);
      toast.success(`${selectedUserIds.length} users deleted successfully`);
      setSelectedUserIds([]);
      setIsBulkDeleteOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete some users');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    setBulkLoading(true);
    try {
      const promises = selectedUserIds.map(id => {
        return pb.collection('admin_users').update(id, { status: newStatus }, { $autoCancel: false });
      });
      await Promise.all(promises);
      toast.success(`${selectedUserIds.length} users updated successfully`);
      setSelectedUserIds([]);
      setIsBulkStatusOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update some users');
    } finally {
      setBulkLoading(false);
    }
  };

  const getExportData = () => {
    const dataToExport = selectedUserIds.length > 0 
      ? users.filter(u => selectedUserIds.includes(u.id))
      : filteredAndSortedUsers;
      
    return dataToExport.map(u => ({
      ID: u.id,
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      Joined: new Date(u.created).toLocaleDateString()
    }));
  };

  const selectedUsersData = users.filter(u => selectedUserIds.includes(u.id));
  const hasActiveFilters = searchQuery || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <CrmLayout 
      title="Admin Users" 
      description="Manage system access, roles, and administrative permissions."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Admin Users' }
      ]}
    >
      <Helmet>
        <title>User Management - CRM</title>
      </Helmet>

      <div className="space-y-6 pb-20">
        {/* Top Bar: Search, Filters, Add Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-card p-4 rounded-2xl border shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="px-3 text-muted-foreground hover:text-foreground">
                <FilterX className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <ExportMenu 
              onExportCSV={() => exportToCSV(getExportData(), 'admin_users')}
              onExportExcel={() => exportToExcel(getExportData(), 'admin_users')}
              totalCount={users.length}
              filteredCount={filteredAndSortedUsers.length}
              selectedCount={selectedUserIds.length}
            />
            <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={paginatedUsers.length > 0 && selectedUserIds.length === paginatedUsers.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-16">Avatar</TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('fullName')}>
                    User {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('role')}>
                    Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors hidden md:table-cell" onClick={() => handleSort('created')}>
                    Joined {sortConfig.key === 'created' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Shield className="h-8 w-8 mb-2 opacity-50" />
                        <p>No admin users found</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={clearFilters} className="mt-2 h-auto p-0 text-primary">
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                          aria-label={`Select ${user.fullName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-foreground">
                          <SearchHighlight text={user.fullName || 'Unnamed User'} searchTerm={searchQuery} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <SearchHighlight text={user.email} searchTerm={searchQuery} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize bg-background text-foreground">
                          {user.role || 'Viewer'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'Active' ? 'default' : 'secondary'} 
                          className={user.status === 'Active' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                        >
                          {user.status || 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-medium">
                        {new Date(user.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditUser(user)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            
                            {user.status === 'Active' ? (
                              <DropdownMenuItem onClick={() => setDeactivateUser(user)} className="text-amber-600 focus:text-amber-600">
                                <UserX className="mr-2 h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setActivateUser(user)} className="text-emerald-600 focus:text-emerald-600">
                                <UserCheck className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteUser(user)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          {!loading && filteredAndSortedUsers.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
              <PaginationInfo 
                currentPage={page} 
                itemsPerPage={itemsPerPage} 
                totalItems={filteredAndSortedUsers.length} 
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium px-2">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BulkActionsToolbar 
        selectedCount={selectedUserIds.length}
        onClear={() => setSelectedUserIds([])}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onChangeStatus={() => setIsBulkStatusOpen(true)}
      />

      <BulkDeleteDialog 
        isOpen={isBulkDeleteOpen}
        count={selectedUserIds.length}
        isLoading={bulkLoading}
        onCancel={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <BulkStatusChangeDialog 
        isOpen={isBulkStatusOpen}
        count={selectedUserIds.length}
        statuses={[
          {label: 'Active', value: 'Active'}, 
          {label: 'Inactive', value: 'Inactive'},
          {label: 'Suspended', value: 'Suspended'}
        ]}
        isLoading={bulkLoading}
        onCancel={() => setIsBulkStatusOpen(false)}
        onConfirm={handleBulkStatusChange}
      />

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
      
      {/* Assuming standard sub-modals take generic 'user' prop objects */}
      {editUser && (
        <EditUserModal 
          isOpen={!!editUser} 
          onClose={() => setEditUser(null)} 
          onSuccess={fetchUsers} 
          user={editUser} 
        />
      )}
      
      {deleteUser && (
        <DeleteUserConfirmationDialog 
          isOpen={!!deleteUser} 
          onClose={() => setDeleteUser(null)} 
          onSuccess={() => {
            setSelectedUserIds(prev => prev.filter(id => id !== deleteUser?.id));
            fetchUsers();
          }} 
          user={deleteUser}
          allUsers={users}
        />
      )}
      
      {deactivateUser && (
        <DeactivateUserConfirmationDialog 
          isOpen={!!deactivateUser} 
          onClose={() => setDeactivateUser(null)} 
          onSuccess={fetchUsers} 
          user={deactivateUser}
          allUsers={users}
        />
      )}
      
      {activateUser && (
        <ActivateUserConfirmationDialog 
          isOpen={!!activateUser} 
          onClose={() => setActivateUser(null)} 
          onSuccess={fetchUsers} 
          user={activateUser} 
        />
      )}
      
      {isBulkRoleModalOpen && (
        <BulkRoleChangeDialog 
          isOpen={isBulkRoleModalOpen} 
          onClose={() => setIsBulkRoleModalOpen(false)} 
          onSuccess={() => {
            setSelectedUserIds([]);
            fetchUsers();
          }} 
          selectedUsers={selectedUsersData}
          allUsers={users}
        />
      )}

    </CrmLayout>
  );
};

export default CrmUserManagementPage;
