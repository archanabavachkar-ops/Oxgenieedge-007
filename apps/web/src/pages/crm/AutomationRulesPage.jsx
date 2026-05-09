import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Search, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import RuleBuilder from '@/components/crm/integrations/RuleBuilder.jsx';
import pb from '@/lib/pocketbaseClient';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const AutomationRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('automation_rules').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setRules(records);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await pb.collection('automation_rules').update(id, { is_active: !currentStatus }, { $autoCancel: false });
      setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
      toast.success(`Rule ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await pb.collection('automation_rules').delete(id, { $autoCancel: false });
        setRules(rules.filter(r => r.id !== id));
        toast.success('Rule deleted successfully');
      } catch (error) {
        toast.error('Failed to delete rule');
      }
    }
  };

  const openBuilder = (rule = null) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const filteredRules = rules.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <CrmLayout title="Automation Rules">
      <Helmet>
        <title>Automation Rules - CRM</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <p className="text-muted-foreground max-w-2xl text-balance">
          Create powerful workflows that trigger actions across your connected integrations automatically.
        </p>
        <Button onClick={() => openBuilder()}>
          <Plus className="w-4 h-4 mr-2" /> Create New Rule
        </Button>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search rules..." 
              className="pl-9 bg-background text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Executions</TableHead>
              <TableHead>Last Executed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading rules...</TableCell>
              </TableRow>
            ) : filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Zap className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-foreground mb-1">No automation rules found</p>
                    <p className="mb-4">Create your first rule to automate your workflow.</p>
                    <Button variant="outline" onClick={() => openBuilder()}>Create Rule</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{rule.trigger_integration}</Badge>
                      <span className="text-muted-foreground text-sm">→ {rule.trigger_event}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.is_active} 
                        onCheckedChange={() => handleToggleStatus(rule.id, rule.is_active)} 
                      />
                      <span className="text-sm text-muted-foreground">{rule.is_active ? 'Active' : 'Paused'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{rule.execution_count || 0}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {rule.last_executed ? `${formatDistanceToNow(new Date(rule.last_executed))} ago` : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openBuilder(rule)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isBuilderOpen && (
        <RuleBuilder 
          isOpen={isBuilderOpen} 
          onClose={() => setIsBuilderOpen(false)} 
          onSave={fetchRules}
          initialData={editingRule}
        />
      )}
    </CrmLayout>
  );
};

export default AutomationRulesPage;