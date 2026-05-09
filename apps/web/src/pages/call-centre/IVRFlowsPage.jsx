import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, Play, MoreVertical, Edit2, Trash2, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import IVRFlowBuilder from '@/components/call-centre/IVRFlowBuilder';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const IVRFlowsPage = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Test Modal State
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [flowToTest, setFlowToTest] = useState(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/ivr/flows');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch IVR flows');
      
      // Handle both formats: direct array or { flows: [] }
      const flowsList = Array.isArray(data) ? data : (data.flows || []);
      setFlows(flowsList);
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Could not load IVR flows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (flow) => {
    try {
      const updatedStatus = !flow.is_active;
      const response = await apiServerClient.fetch(`/ivr/flows/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setFlows(flows.map(f => f.id === flow.id ? { ...f, is_active: updatedStatus } : f));
      toast.success(`Flow ${updatedStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Could not update flow status');
    }
  };

  const confirmDelete = async () => {
    if (!flowToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiServerClient.fetch(`/ivr/flows/${flowToDelete.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      setFlows(flows.filter(f => f.id !== flowToDelete.id));
      toast.success('Flow deleted successfully');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Could not delete flow');
    } finally {
      setIsDeleting(false);
      setFlowToDelete(null);
    }
  };

  const openEdit = (flow) => {
    setEditingFlow(flow);
    setIsBuilderOpen(true);
  };

  const handleSaveFlow = (savedFlow) => {
    if (editingFlow) {
      setFlows(flows.map(f => f.id === savedFlow.id ? savedFlow : f));
    } else {
      setFlows([savedFlow, ...flows]);
    }
  };

  const filteredFlows = flows.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase()) || 
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>IVR Flows - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">IVR Flows</h1>
            <p className="text-muted-foreground">Design and manage Interactive Voice Response menus.</p>
          </div>
          <Button onClick={() => { setEditingFlow(null); setIsBuilderOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Create Flow
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search flows..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredFlows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No IVR flows found. Create your first flow to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlows.map((flow) => (
                    <TableRow key={flow.id}>
                      <TableCell className="font-medium">{flow.name}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">{flow.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{Array.isArray(flow.steps) ? flow.steps.length : 0} steps</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={flow.is_active ? 'bg-success hover:bg-success/90 text-success-foreground' : 'bg-muted text-muted-foreground'}>
                          {flow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(flow.updated || flow.updated_at || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setFlowToTest(flow); setIsTestOpen(true); }}>
                              <Play className="mr-2 h-4 w-4 text-primary" /> Test Flow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(flow)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(flow)}>
                              <Power className="mr-2 h-4 w-4" /> {flow.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => { setFlowToDelete(flow); setIsDeleteOpen(true); }}
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
        </Card>
      </main>

      <IVRFlowBuilder 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        flow={editingFlow} 
        onSave={handleSaveFlow} 
      />

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete IVR Flow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the flow "{flowToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Flow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Flow Simulator (Placeholder for UI visually) */}
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Flow: {flowToTest?.name}</DialogTitle>
            <DialogDescription>Simulate a call passing through this IVR flow.</DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-lg border border-dashed">
            <Play className="h-12 w-12 text-primary opacity-50" />
            <p className="text-sm text-muted-foreground max-w-[250px]">
              This flow is ready to test. In a real scenario, this connects to the simulator dialpad.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestOpen(false)}>Close</Button>
            <Button onClick={() => toast.success('Simulation started')}>Start Simulation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IVRFlowsPage;