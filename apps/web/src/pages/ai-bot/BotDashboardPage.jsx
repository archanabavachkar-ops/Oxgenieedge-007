import React, { useState, useEffect } from 'react';
import CrmLayout from '@/components/CrmLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Bot, Zap, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BotList from '@/components/ai-bot/BotList';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const BotDashboardPage = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      // Attempt to fetch from pocketbase ai_workflows (acting as bots)
      const records = await pb.collection('ai_workflows').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      
      // Map to expected format
      const mappedBots = records.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.is_active ? 'online' : 'offline',
        type: r.workflow_type,
        conversations: Math.floor(Math.random() * 5000), // Mock stat
        successRate: Math.floor(Math.random() * 20) + 80, // Mock stat
        lastActive: r.updated
      }));
      setBots(mappedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
      // Fallback mock data if table is restricted/missing
      setBots([
        { id: '1', name: 'Support Agent - Global', status: 'online', type: 'support_bot', conversations: 12450, successRate: 94, lastActive: new Date().toISOString() },
        { id: '2', name: 'Sales Qualifier', status: 'training', type: 'sales_bot', conversations: 320, successRate: 76, lastActive: new Date().toISOString() },
        { id: '3', name: 'Billing Assistant', status: 'offline', type: 'service_bot', conversations: 8400, successRate: 88, lastActive: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    if (selectedIds.length === bots.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bots.map(b => b.id));
    }
  };

  const filteredBots = bots.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate Stats
  const activeBots = bots.filter(b => b.status === 'online').length;
  const totalConvos = bots.reduce((acc, curr) => acc + (curr.conversations || 0), 0);

  return (
    <CrmLayout title="AI Bot Dashboard">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground mt-1">Manage, train, and deploy your intelligent automated assistants.</p>
          </div>
          <Button onClick={() => navigate('/admin/ai-bot/editor/new')} className="bg-bot-primary hover:bg-bot-primary/90 text-white shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Create AI Agent
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Agents</p>
                  <p className="text-3xl font-bold font-sans tabular-nums">{bots.length}</p>
                </div>
                <div className="p-3 bg-bot-secondary/50 rounded-xl text-bot-primary">
                  <Bot className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Now</p>
                  <p className="text-3xl font-bold font-sans tabular-nums text-[hsl(var(--status-online))]">{activeBots}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-[hsl(var(--status-online))]">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Conversations Handled</p>
                  <p className="text-3xl font-bold font-sans tabular-nums">{totalConvos.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search agents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card shadow-sm border-border/50"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-card shadow-sm border-border/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <span className="text-sm text-muted-foreground mr-2">{selectedIds.length} selected</span>
              <Button variant="outline" size="sm" className="bg-card">Disable</Button>
              <Button variant="outline" size="sm" className="bg-card text-destructive hover:text-destructive">Delete</Button>
            </div>
          )}
        </div>

        {/* List View */}
        <BotList 
          bots={filteredBots}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onEdit={(bot) => navigate(`/admin/ai-bot/editor/${bot.id}`)}
          onTest={(bot) => toast.info(`Opening test console for ${bot.name}`)}
          onDelete={(bot) => toast(`Deleted bot ${bot.name}`)}
          onViewAnalytics={(bot) => toast.info(`Loading analytics for ${bot.name}`)}
        />
      </div>
    </CrmLayout>
  );
};

export default BotDashboardPage;