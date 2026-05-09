import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Edit, Trash2, Zap, ArrowUpDown } from 'lucide-react';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';
import AutoReplyEditor from '@/components/AutoReplyEditor';

const AutoReplyPage = () => {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Rules
      let rulesData = [];
      try {
        const response = await apiServerClient.fetch('/auto-reply');
        if (response.ok) rulesData = await response.json();
        else throw new Error('API fallback');
      } catch (err) {
        rulesData = await pb.collection('auto_reply_rules').getFullList({
          sort: 'priority',
          $autoCancel: false
        });
      }
      setRules(rulesData);

      // Fetch Templates for the editor dropdown
      let templatesData = [];
      try {
        const response = await apiServerClient.fetch('/templates');
        if (response.ok) templatesData = await response.json();
        else throw new Error('API fallback');
      } catch (err) {
        templatesData = await pb.collection('message_templates').getFullList({
          $autoCancel: false
        });
      }
      setTemplates(templatesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load auto-reply rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      try {
        await apiServerClient.fetch(`/auto-reply/${id}`, { method: 'DELETE' });
      } catch (err) {
        await pb.collection('auto_reply_rules').delete(id, { $autoCancel: false });
      }
      toast.success('Rule deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const openEditor = (rule = null) => {
    setEditingRule(rule);
    setIsEditorOpen(true);
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'all' || r.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Auto-Reply Rules - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Auto-Reply Rules</h1>
            <p className="text-muted-foreground mt-1">Configure automated responses based on triggers and conditions.</p>
          </div>
          <Button onClick={() => openEditor()} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rules..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Filter by channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="chat">Live Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Priority</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading rules...
                    </TableCell>
                  </TableRow>
                ) : filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Zap className="h-12 w-12 mb-4 opacity-20" />
                        <p>No auto-reply rules found.</p>
                        <Button variant="link" onClick={() => openEditor()} className="mt-2">
                          Create your first rule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ArrowUpDown className="h-3 w-3" />
                          {rule.priority}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {rule.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {rule.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {rule.trigger_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditor(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <AutoReplyEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        rule={editingRule}
        templates={templates}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AutoReplyPage;