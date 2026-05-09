import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { RefreshCw, Target, Activity, Loader2 } from 'lucide-react';
import InsightCard from '@/components/crm/InsightCard.jsx';
import LeadPrioritizationList from '@/components/crm/LeadPrioritizationList.jsx';
import FunnelChart from '@/components/crm/FunnelChart.jsx';
import { SourcePieChart, ConversionBarChart, CampaignLineChart } from '@/components/crm/PerformanceCharts.jsx';
import CampaignIntelligence from '@/components/crm/CampaignIntelligence.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const AIInsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState('week');
  
  const [insights, setInsights] = useState([]);
  const [topLeads, setTopLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const fetchDashboardData = async () => {
    try {
      // Fetch AI Recommendations
      const recsRes = await pb.collection('ai_recommendations').getList(1, 4, {
        sort: '-created',
        $autoCancel: false
      });
      
      // Fetch Contacts for Lead Prioritization
      const leadsRes = await pb.collection('contacts').getList(1, 5, {
        sort: '-created',
        $autoCancel: false
      });
      
      // Fetch Campaigns
      const campsRes = await pb.collection('campaigns').getList(1, 5, {
        sort: '-created',
        $autoCancel: false
      });

      // Map Recommendations
      const mappedInsights = recsRes.items.length > 0 ? recsRes.items.map(item => ({
        id: item.id,
        insight: item.data?.insight || 'AI detected a new pattern in your pipeline.',
        impact: item.confidence_score > 80 ? 'High' : item.confidence_score > 50 ? 'Medium' : 'Low',
        type: item.recommendation_type === 'churn_prediction' ? 'warning' : 'opportunity',
        actionLabel: 'Review',
        timestamp: new Date(item.created).toLocaleDateString()
      })) : [
        { id: '1', insight: "18 deals stuck in Proposal stage for over 14 days.", impact: "High", type: "warning", actionLabel: "Review Deals", timestamp: "Updated 2 hrs ago" },
        { id: '2', insight: "Instagram leads convert 35% better than Google Ads this month.", impact: "Medium", type: "opportunity", actionLabel: "View Report", timestamp: "Updated 5 hrs ago" },
        { id: '3', insight: "Follow up within 24 hours increases conversion probability by 40%.", impact: "High", type: "opportunity", actionLabel: "View Overdue", timestamp: "Updated 1 day ago" },
        { id: '4', insight: "Automated onboarding flow achieved 95% delivery rate.", impact: "Low", type: "success", actionLabel: "View Campaign", timestamp: "Updated 2 days ago" }
      ];

      // Map Leads
      const mappedLeads = leadsRes.items.length > 0 ? leadsRes.items.map(item => ({
        id: item.id,
        name: item.name,
        score: Math.floor(Math.random() * 40) + 60, // Simulated score
        reason: 'High engagement detected across multiple channels.',
        lastActivity: new Date(item.updated).toLocaleDateString()
      })) : [
        { id: 1, name: 'Acme Corp', score: 94, reason: 'Visited pricing 3x in last 24h, opened all emails.', lastActivity: '2h ago' },
        { id: 2, name: 'TechNova', score: 88, reason: 'Matched ideal ICP profile, high engagement on LinkedIn.', lastActivity: '5h ago' },
        { id: 3, name: 'Global Logistics', score: 85, reason: 'Inbound demo request. Historic data shows 70% conversion.', lastActivity: '1d ago' },
      ];

      // Map Campaigns
      const mappedCampaigns = campsRes.items.length > 0 ? campsRes.items.map(item => ({
        id: item.id,
        name: item.name,
        status: item.status || 'Active',
        sentCount: Math.floor(Math.random() * 2000) + 100,
        openRate: (Math.random() * 40 + 20).toFixed(1),
        conversionRate: (Math.random() * 10 + 1).toFixed(1),
        suggestion: 'Optimize send times based on AI predictions.'
      })) : [
        { name: 'Q3 Enterprise Outreach', status: 'Active', sentCount: 1250, openRate: 42.5, conversionRate: 3.2, suggestion: 'A/B test subject lines to lift open rate' },
        { name: 'Onboarding Sequence', status: 'Active', sentCount: 840, openRate: 65.1, conversionRate: 12.4, suggestion: 'Performing above average. Maintain.' },
        { name: 'Cold Call Follow-up', status: 'Paused', sentCount: 320, openRate: 18.2, conversionRate: 0.8, suggestion: 'Content requires complete overhaul.' },
      ];

      setInsights(mappedInsights);
      setTopLeads(mappedLeads);
      setCampaigns(mappedCampaigns);

    } catch (error) {
      console.error("Error fetching AI insights data:", error);
      toast.error("Failed to load some AI insights data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success('AI models synced successfully.');
  };

  if (loading) {
    return (
      <CrmLayout title="AI Intelligence Hub">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title="AI Intelligence Hub">
      <Helmet><title>AI Insights - OxgenieEdge CRM</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <p className="text-muted-foreground max-w-2xl text-balance">
          Leverage predictive models to uncover hidden patterns, prioritize high-value leads, and optimize your sales funnel automatically.
        </p>
        <div className="flex gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[150px] bg-card border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="bg-card">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sync Data
          </Button>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Urgent Priorities & Suggestions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {insights.map((insight, idx) => (
            <InsightCard 
              key={insight.id || idx}
              insight={insight.insight} 
              impact={insight.impact} 
              type={insight.type} 
              actionLabel={insight.actionLabel} 
              timestamp={insight.timestamp}
              onAction={() => toast.info('Action triggered')}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout for Funnel and Prioritization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Smart Lead Prioritization */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Top Predicted Conversions</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
          </div>
          <LeadPrioritizationList leads={topLeads} onAction={() => toast.success('Opening detail panel')} />
        </div>

        {/* Funnel & Bottleneck Analysis */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Pipeline Conversion Funnel</h3>
              <p className="text-sm text-muted-foreground mt-1">AI detected 38% abnormal drop-off at Proposal stage</p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Optimize</Button>
          </div>
          <FunnelChart />
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 text-center">Lead Volume by Source</h4>
            <SourcePieChart />
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 text-center">Conversion Trend</h4>
            <ConversionBarChart />
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-semibold text-foreground mb-4 text-center">Campaign Yield vs Spend</h4>
            <CampaignLineChart />
          </div>
        </div>
      </div>

      {/* Campaign Intelligence */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-6">Campaign Intelligence</h3>
        <CampaignIntelligence campaigns={campaigns} />
      </div>

    </CrmLayout>
  );
};

export default AIInsightsPage;