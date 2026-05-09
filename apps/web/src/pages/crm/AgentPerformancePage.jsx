import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Calendar as CalendarIcon, TrendingUp, Users, Target, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { format, subDays, isWithinInterval, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function AgentPerformancePage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [sortBy, setSortBy] = useState('conversion');
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [agentsData, leadsData] = await Promise.all([
          pb.collection('agents').getFullList({ $autoCancel: false }),
          pb.collection('leads').getFullList({ $autoCancel: false })
        ]);
        setAgents(agentsData);
        setLeads(leadsData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('Failed to load agent performance data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const performanceData = useMemo(() => {
    if (!agents.length || !leads.length) return [];

    // Filter leads by date range
    const filteredLeads = leads.filter(lead => {
      if (!dateRange?.from) return true;
      const createdDate = new Date(lead.created);
      if (dateRange.to) {
        return isWithinInterval(createdDate, { start: dateRange.from, end: endOfDay(dateRange.to) });
      }
      return createdDate >= dateRange.from;
    });

    // Calculate metrics per agent
    const metrics = agents.map(agent => {
      const agentLeads = filteredLeads.filter(l => l.assignedTo === agent.id);
      const totalAssigned = agentLeads.length;
      const closedWon = agentLeads.filter(l => {
        const s = l.status?.toLowerCase() || '';
        return s.includes('won') || s.includes('success');
      }).length;
      
      const conversionRate = totalAssigned > 0 ? (closedWon / totalAssigned) * 100 : 0;

      return {
        ...agent,
        totalAssigned,
        closedWon,
        conversionRate,
        avgResponseTime: 'N/A', // Placeholder as it's not in schema
        totalRevenue: 'N/A'     // Placeholder as it's not in schema
      };
    });

    // Sort metrics
    return metrics.sort((a, b) => {
      if (sortBy === 'conversion') return b.conversionRate - a.conversionRate;
      if (sortBy === 'closed') return b.closedWon - a.closedWon;
      if (sortBy === 'total') return b.totalAssigned - a.totalAssigned;
      return 0;
    });
  }, [agents, leads, dateRange, sortBy]);

  return (
    <CRMLayout
      title="Agent Performance"
      description="Track and analyze individual team member metrics and conversion rates."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Agent Performance' }
      ]}
    >
      <Helmet><title>Agent Performance - CRM</title></Helmet>

      <div className="space-y-6 pb-10">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[260px] justify-start text-left font-normal bg-background",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversion">Conversion Rate</SelectItem>
                <SelectItem value="closed">Leads Closed</SelectItem>
                <SelectItem value="total">Total Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agent Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="shadow-sm border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : performanceData.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No Agents Found</h3>
            <p className="text-muted-foreground mt-1">There is no performance data for the selected period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((agent, index) => (
              <Link key={agent.id} to={`/admin/crm/agent-performance/${agent.id}`} className="block group">
                <Card className="h-full shadow-sm border-border/60 hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 bg-card">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarFallback className={cn(
                            "text-sm font-bold",
                            index === 0 ? "bg-amber-100 text-amber-700" :
                            index === 1 ? "bg-slate-100 text-slate-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-primary/10 text-primary"
                          )}>
                            {agent.name?.substring(0, 2).toUpperCase() || 'AG'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">{agent.department || 'Sales'}</p>
                        </div>
                      </div>
                      {index < 3 && sortBy === 'conversion' && agent.conversionRate > 0 && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                          Top {index + 1}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Target className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium uppercase tracking-wider">Assigned</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{agent.totalAssigned}</p>
                      </div>
                      <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                        <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium uppercase tracking-wider">Win Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">{agent.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Target className="h-4 w-4 opacity-70" /> Leads Closed
                        </span>
                        <span className="font-semibold text-foreground">{agent.closedWon}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-70" /> Avg Response
                        </span>
                        <span className="font-medium text-muted-foreground">{agent.avgResponseTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4 opacity-70" /> Revenue
                        </span>
                        <span className="font-medium text-muted-foreground">{agent.totalRevenue}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View detailed report <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}