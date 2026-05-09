import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Loader2, Download, Calendar as CalendarIcon, TrendingUp, Target, Filter, Activity, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, startOfMonth, subMonths, endOfMonth, isWithinInterval, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [date, setDate] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true);
      setError(null);
      try {
        const leadsData = await pb.collection('leads').getFullList({ sort: '-created', $autoCancel: false });
        setLeads(leadsData);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        setError('Failed to load comprehensive analytics data.');
        toast.error('Failed to load report data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReportData();
  }, []);

  const metrics = useMemo(() => {
    if (!leads.length) return null;

    // Apply date filter
    const filteredLeads = leads.filter(lead => {
      if (!date?.from) return true;
      const createdDate = new Date(lead.created);
      if (date.to) {
        return isWithinInterval(createdDate, { start: date.from, end: endOfDay(date.to) });
      }
      return createdDate >= date.from;
    });

    const totalLeads = filteredLeads.length;

    // 1. Overall Status Breakdown
    const statusCounts = { 'New': 0, 'In Progress': 0, 'Qualified': 0, 'Closed Won': 0, 'Closed Lost': 0, 'Other': 0 };
    filteredLeads.forEach(lead => {
      const s = lead.status?.toLowerCase() || '';
      if (s.includes('new')) statusCounts['New']++;
      else if (s.includes('contact') || s.includes('follow') || s.includes('negotiation') || s.includes('proposal')) statusCounts['In Progress']++;
      else if (s.includes('qualified')) statusCounts['Qualified']++;
      else if (s.includes('won') || s.includes('success')) statusCounts['Closed Won']++;
      else if (s.includes('lost') || s.includes('fail') || s.includes('reject')) statusCounts['Closed Lost']++;
      else statusCounts['Other']++;
    });

    const overallConversion = totalLeads > 0 ? (statusCounts['Closed Won'] / totalLeads) * 100 : 0;

    // 2. Source Analytics Setup
    const sourceStats = {};
    filteredLeads.forEach(lead => {
      const src = lead.source || 'Other';
      if (!sourceStats[src]) {
        sourceStats[src] = { total: 0, won: 0, revenue: 0 };
      }
      sourceStats[src].total += 1;
      
      const s = lead.status?.toLowerCase() || '';
      if (s.includes('won') || s.includes('success')) {
        sourceStats[src].won += 1;
        // In a real app, sum actual deal values. Placeholder math here if values aren't in schema:
        // We'll leave revenue at 0 since there's no `value` on leads directly in the schema provided.
      }
    });

    // Transform for Recharts
    const sourceDistributionData = Object.keys(sourceStats).map((src, index) => {
      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(var(--accent))'];
      return {
        name: src,
        value: sourceStats[src].total,
        color: colors[index % colors.length]
      };
    }).sort((a, b) => b.value - a.value);

    // Source Performance Table Data
    const sourcePerformanceData = Object.keys(sourceStats).map(src => {
      const stats = sourceStats[src];
      const conversionRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;
      return {
        source: src,
        total: stats.total,
        won: stats.won,
        conversionRate,
        avgValue: 'N/A' // Schema doesn't have value per lead
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);

    // Top 3 Sources by Conversion Rate (minimum 1 lead to qualify to prevent 100% on 1 lead from winning easily)
    const topSources = sourcePerformanceData
      .filter(s => s.total > 0)
      .slice(0, 3);

    // Funnel Data (mocked based on statuses, since stage progression isn't fully tracked historically)
    const funnelData = [
      { name: "Total Leads", value: totalLeads },
      { name: "In Progress", value: statusCounts['In Progress'] + statusCounts['Qualified'] + statusCounts['Closed Won'] },
      { name: "Qualified", value: statusCounts['Qualified'] + statusCounts['Closed Won'] },
      { name: "Closed Won", value: statusCounts['Closed Won'] }
    ];

    return {
      totalLeads,
      overallConversion,
      sourceDistributionData,
      sourcePerformanceData,
      topSources,
      funnelData,
      statusCounts
    };
  }, [leads, date]);

  return (
    <CRMLayout
      title="Sales Analytics & Reports"
      description="Track performance, analyze lead sources, and monitor conversions."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Reports' }
      ]}
    >
      <Helmet><title>Reports - CRM</title></Helmet>

      <div className="space-y-8 pb-10">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Reporting Period</h2>
            <p className="text-sm text-muted-foreground">Select a date range to filter all dashboard metrics.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal bg-background",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" title="Export Report">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lead Quality Highlights */}
        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-card to-accent/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Lead Quality by Source
                </h3>
                <p className="text-sm text-muted-foreground text-balance">
                  These are your top performing acquisition channels based on conversion rates. Focus your marketing efforts here.
                </p>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-4 w-full md:w-auto md:justify-end">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-40 rounded-xl" />)
                ) : metrics?.topSources?.length > 0 ? (
                  metrics.topSources.map((src, idx) => (
                    <div key={src.source} className="bg-background/80 backdrop-blur-sm border rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px] shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className={cn(
                          "px-1.5 py-0 rounded text-[10px] uppercase font-bold",
                          idx === 0 ? "bg-amber-100 text-amber-700" :
                          idx === 1 ? "bg-slate-200 text-slate-700" :
                          "bg-orange-100 text-orange-700"
                        )}>
                          #{idx + 1}
                        </Badge>
                        <span className="font-semibold text-sm truncate" title={src.source}>{src.source}</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {src.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">
                        Win Rate ({src.won}/{src.total})
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Not enough data to determine top sources.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{metrics?.totalLeads || 0}</h3>}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closed Won</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{metrics?.statusCounts['Closed Won'] || 0}</h3>}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Win Rate</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{metrics?.overallConversion.toFixed(1)}%</h3>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Distribution */}
          <Card className="shadow-sm border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle>Lead Distribution by Source</CardTitle>
              <CardDescription>Where are your leads coming from?</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              ) : metrics?.sourceDistributionData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.sourceDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {metrics.sourceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No source data available for selected period.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Rate by Source */}
          <Card className="shadow-sm border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle>Conversion Rate by Source</CardTitle>
              <CardDescription>Which sources produce the highest win rates?</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : metrics?.sourcePerformanceData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={metrics.sourcePerformanceData} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="source" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, 'Conversion Rate']}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="conversionRate" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No conversion data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Performance Table */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Source Performance Matrix</CardTitle>
            <CardDescription>Detailed breakdown of acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : metrics?.sourcePerformanceData?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[200px]">Lead Source</TableHead>
                      <TableHead className="text-right">Total Leads</TableHead>
                      <TableHead className="text-right">Closed Won</TableHead>
                      <TableHead className="text-right">Conversion Rate</TableHead>
                      <TableHead className="text-right pr-4">Avg Lead Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.sourcePerformanceData.map((row) => (
                      <TableRow key={row.source} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.source}</TableCell>
                        <TableCell className="text-right">{row.total}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">{row.won}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{row.conversionRate.toFixed(1)}%</span>
                            {/* Simple visual bar for conversion rate */}
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${row.conversionRate}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 text-muted-foreground">{row.avgValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No source performance data for the selected period.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}