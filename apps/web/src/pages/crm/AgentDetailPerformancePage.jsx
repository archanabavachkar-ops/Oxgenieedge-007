import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { ArrowLeft, Target, TrendingUp, Clock, DollarSign, Mail, Phone, Briefcase, Activity } from 'lucide-react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function AgentDetailPerformancePage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  
  const [agent, setAgent] = useState(null);
  const [agentLeads, setAgentLeads] = useState([]);
  const [teamAvg, setTeamAvg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      setIsLoading(true);
      try {
        // Fetch specific agent
        const agentData = await pb.collection('agents').getOne(agentId, { $autoCancel: false });
        setAgent(agentData);

        // Fetch all leads to calculate both agent specific and team averages
        const allLeads = await pb.collection('leads').getFullList({ $autoCancel: false });
        
        const specificLeads = allLeads.filter(l => l.assignedTo === agentId);
        setAgentLeads(specificLeads);

        // Calculate Team Averages
        const agentsWithLeads = new Set(allLeads.filter(l => l.assignedTo).map(l => l.assignedTo)).size;
        const totalClosedWon = allLeads.filter(l => {
          const s = l.status?.toLowerCase() || '';
          return s.includes('won') || s.includes('success');
        }).length;
        
        setTeamAvg({
          avgLeadsAssigned: agentsWithLeads > 0 ? Math.round(allLeads.length / agentsWithLeads) : 0,
          avgConversionRate: allLeads.length > 0 ? (totalClosedWon / allLeads.length) * 100 : 0
        });

      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast.error('Failed to load agent details');
        navigate('/admin/crm/agent-performance');
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentData();
    }
  }, [agentId, navigate]);

  const metrics = useMemo(() => {
    if (!agentLeads.length) return { total: 0, closedWon: 0, conversionRate: 0, statusData: [], timelineData: [], recentDeals: [] };

    const total = agentLeads.length;
    const closedWonLeads = agentLeads.filter(l => {
      const s = l.status?.toLowerCase() || '';
      return s.includes('won') || s.includes('success');
    });
    const closedWon = closedWonLeads.length;
    const conversionRate = total > 0 ? (closedWon / total) * 100 : 0;

    // Status Breakdown
    const statusCounts = {};
    agentLeads.forEach(lead => {
      const status = lead.status || 'New';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusColors = {
      'New Lead': 'hsl(var(--status-new))',
      'Attempted Contact': 'hsl(var(--status-progress))',
      'Connected': 'hsl(var(--status-progress))',
      'Qualified': 'hsl(var(--status-qualified))',
      'Won': 'hsl(var(--status-won))',
      'Lost': 'hsl(var(--status-lost))'
    };

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || 'hsl(var(--muted-foreground))'
    }));

    // Timeline Data (Last 6 months)
    const timelineData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthLeads = agentLeads.filter(l => isWithinInterval(new Date(l.created), { start, end }));
      const monthWon = monthLeads.filter(l => {
        const s = l.status?.toLowerCase() || '';
        return s.includes('won') || s.includes('success');
      }).length;

      timelineData.push({
        name: format(monthDate, 'MMM yyyy'),
        assigned: monthLeads.length,
        won: monthWon
      });
    }

    // Recent Deals
    const recentDeals = closedWonLeads
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, 5);

    return {
      total,
      closedWon,
      conversionRate,
      statusData,
      timelineData,
      recentDeals
    };
  }, [agentLeads]);

  if (isLoading) {
    return (
      <CRMLayout title="Agent Performance Details">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout
      title="Agent Performance Details"
      description="In-depth analysis of individual agent metrics and pipeline."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Agent Performance', path: '/admin/crm/agent-performance' },
        { label: agent?.name || 'Details' }
      ]}
    >
      <Helmet><title>{agent?.name || 'Agent'} Performance - CRM</title></Helmet>

      <div className="space-y-6 pb-10">
        {/* Header / Profile Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {agent?.name?.substring(0, 2).toUpperCase() || 'AG'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{agent?.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {agent?.department || 'Sales'}</span>
                <span className="flex items-center gap-1.5"><Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge></span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/crm/agent-performance')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Team Avg: {teamAvg?.avgLeadsAssigned || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Closed Won</p>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-emerald-600">{metrics.closedWon}</div>
              <p className="text-xs text-muted-foreground mt-1">Successful conversions</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Team Avg: {teamAvg?.avgConversionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-muted-foreground/50">N/A</div>
              <p className="text-xs text-muted-foreground mt-1">Tracking disabled</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-muted-foreground/50">N/A</div>
              <p className="text-xs text-muted-foreground mt-1">Value not tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <Card className="shadow-sm border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle>Pipeline Distribution</CardTitle>
              <CardDescription>Current status of all assigned leads</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
              {metrics.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No active leads in pipeline</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card className="shadow-sm border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle>Performance Trend (6 Months)</CardTitle>
              <CardDescription>Leads assigned vs closed won over time</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="assigned" name="Assigned" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="won" name="Closed Won" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deals Table */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Closed Deals</CardTitle>
            <CardDescription>Latest successful conversions by this agent</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentDeals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Close Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.recentDeals.map((deal) => (
                      <TableRow key={deal.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">{deal.mobile}</div>
                          <div className="text-xs text-muted-foreground">{deal.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                            {deal.source || 'Direct'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {format(new Date(deal.updated), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No closed deals found for this agent yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}