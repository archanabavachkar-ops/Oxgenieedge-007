import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, MoreVertical, Edit2, Trash2, Power, Route, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import RoutingRuleBuilder from '@/components/call-centre/RoutingRuleBuilder';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const RoutingRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/routing/rules');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch routing rules');
      
      const rulesList = Array.isArray(data) ? data : (data.rules || []);
      // Sort by priority ascending (lower number = higher priority)
      rulesList.sort((a, b) => a.priority - b.priority);
      setRules(rulesList);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Could not load routing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      const updatedStatus = !rule.is_active;
      const response = await apiServerClient.fetch(`/routing/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: updatedStatus } : r));
      toast.success(`Rule ${updatedStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Could not update rule status');
    }
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiServerClient.fetch(`/routing/rules/${ruleToDelete.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      toast.success('Rule deleted successfully');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Could not delete rule');
    } finally {
      setIsDeleting(false);
      setRuleToDelete(null);
    }
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const handleSaveRule = (savedRule) => {
    let updatedRules;
    if (editingRule) {
      updatedRules = rules.map(r => r.id === savedRule.id ? savedRule : r);
    } else {
      updatedRules = [...rules, savedRule];
    }
    updatedRules.sort((a, b) => a.priority - b.priority);
    setRules(updatedRules);
  };

  const formatConditions = (conditions) => {
    if (!conditions || Object.keys(conditions).length === 0) return 'Any Call';
    return Object.entries(conditions)
      .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
      .join(', ');
  };

  const filteredRules = rules.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.target_agent_id?.toLowerCase().includes(search.toLowerCase()) ||
    r.target_queue?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Routing Rules - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Routing Rules</h1>
            <p className="text-muted-foreground">Manage logic for directing inbound calls to agents or queues.</p>
          </div>
          <Button onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Create Rule
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rules, agents or queues..." 
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
                  <TableHead className="w-20"><div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Prio</div></TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No routing rules found. Create a rule to direct incoming calls.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-muted-foreground font-medium">{rule.priority}</TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="text-sm max-w-md truncate">
                        {formatConditions(rule.conditions)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {rule.target_queue ? `Queue: ${rule.target_queue}` : `Agent: ${rule.target_agent_id}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={rule.is_active ? 'bg-success hover:bg-success/90 text-success-foreground' : 'bg-muted text-muted-foreground'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => openEdit(rule)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(rule)}>
                              <Power className="mr-2 h-4 w-4" /> {rule.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => { setRuleToDelete(rule); setIsDeleteOpen(true); }}
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

      <RoutingRuleBuilder 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        rule={editingRule} 
        onSave={handleSaveRule} 
      />

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Routing Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the rule "{ruleToDelete?.name}"? This will affect how inbound calls are directed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutingRulesPage;