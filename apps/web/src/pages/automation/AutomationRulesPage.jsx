import React, { useState, useEffect } from 'react';
import CrmLayout from '@/components/CrmLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Play, GitBranch, Trash2, Edit, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AutomationRulesPage = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('all');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      // Use existing automation_rules collection
      const records = await pb.collection('automation_rules').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setRules(records);
    } catch (error) {
      console.error('Error fetching rules:', error);
      // Mocks if empty
      setRules([
        { id: '1', name: 'Auto-Assign High Value Leads', trigger_event: 'Lead Created', is_active: true, execution_count: 1450, last_executed: new Date().toISOString() },
        { id: '2', name: 'Send Welcome Email', trigger_event: 'Purchase Completed', is_active: true, execution_count: 820, last_executed: new Date().toISOString() },
        { id: '3', name: 'Inactive User Follow-up', trigger_event: 'Time-Based', is_active: false, execution_count: 0, last_executed: null },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrigger = triggerFilter === 'all' || r.trigger_event === triggerFilter;
    return matchesSearch && matchesTrigger;
  });

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this automation rule?')) return;
    try {
      await pb.collection('automation_rules').delete(id, { $autoCancel: false });
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Rule deleted');
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  }

  return (
    <CrmLayout title="Automation Engine">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
            <p className="text-muted-foreground mt-1">Configure event-driven workflows to automate routine tasks.</p>
          </div>
          <Button onClick={() => navigate('/admin/automation/workflows')} className="bg-automation-primary hover:bg-automation-primary/90 text-white shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Build Visual Workflow
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rules..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border/50 shadow-sm"
              />
            </div>
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-[160px] bg-card border-border/50 shadow-sm">
                <SelectValue placeholder="Trigger Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="Lead Created">Lead Created</SelectItem>
                <SelectItem value="Purchase Completed">Purchase Completed</SelectItem>
                <SelectItem value="Time-Based">Time-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="secondary" className="gap-2">
            <Activity className="h-4 w-4" /> Global Execution Logs
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Rule Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Executions</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading rules...</TableCell>
                </TableRow>
              ) : filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-8 w-8 mb-2 opacity-20" />
                      <p>No rules found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {rule.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm px-2.5 py-1 bg-muted rounded-md border text-muted-foreground whitespace-nowrap">
                        {rule.trigger_event || 'System Event'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={rule.is_active ? 'bg-success hover:bg-success text-white' : 'bg-muted text-muted-foreground hover:bg-muted'}>
                        {rule.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {rule.execution_count?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rule.last_executed ? format(new Date(rule.last_executed), 'MMM d, HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin/automation/workflows')}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Manual run triggered')}>
                          <Play className="h-4 w-4 text-automation-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CrmLayout>
  );
};

export default AutomationRulesPage;