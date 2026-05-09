
import React, { useState } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { RefreshCw, Clock, Calendar, CalendarDays, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics.js';
import { useFoundersDashboard } from '@/hooks/useFoundersDashboard.js';
import { useActivityFeed } from '@/hooks/useActivityFeed.js';
import { useLeadAssignment } from '@/hooks/useLeadAssignment.js';

import KPIStrip from '@/components/KPIStrip.jsx';
import RevenueFunnel from '@/components/RevenueFunnel.jsx';
import BotVsHumanComparison from '@/components/BotVsHumanComparison.jsx';
import ChannelPerformance from '@/components/ChannelPerformance.jsx';
import TopIntentsChart from '@/components/TopIntentsChart.jsx';
import LeakDetectionPanel from '@/components/LeakDetectionPanel.jsx';
import AgentPerformanceTable from '@/components/AgentPerformanceTable.jsx';
import AIReadinessPanel from '@/components/AIReadinessPanel.jsx';
import ActivityFeed from '@/components/ActivityFeed.jsx';
import { cn } from '@/lib/utils.js';

export default function UnifiedDashboardPage() {
  const [period, setPeriod] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { metrics, isLoading: isMetricsLoading, refresh: refreshMetrics } = useDashboardMetrics(period);
  const { data: foundersData, isLoading: isFoundersLoading, refresh: refreshFounders } = useFoundersDashboard(period);
  const { activities, isLoading: isActivitiesLoading } = useActivityFeed();
  const { assignMultipleLeads, isAssigning } = useLeadAssignment();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshMetrics(), refreshFounders()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAutoAssignAll = async () => {
    try {
      const unassignedLeads = await pb.collection('leads').getFullList({
        filter: 'assignedTo = "" || assignedTo = null',
        $autoCancel: false
      });

      if (unassignedLeads.length === 0) {
        toast.info('No unassigned leads found.');
        return;
      }

      const toastId = toast.loading(`Assigning 0 of ${unassignedLeads.length} leads...`);

      const { successCount, failedCount } = await assignMultipleLeads(
        unassignedLeads.map(l => l.id),
        (current, total) => {
          toast.loading(`Assigning ${current} of ${total} leads...`, { id: toastId });
        }
      );

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} leads. ${failedCount > 0 ? `${failedCount} failed.` : ''}`, { id: toastId });
        handleRefresh();
      } else {
        toast.error(`Failed to assign leads. ${failedCount} errors occurred.`, { id: toastId });
      }
    } catch (error) {
      console.error('Error fetching unassigned leads:', error);
      toast.error('Failed to fetch unassigned leads.');
    }
  };

  const periodOptions = [
    { id: 'today', label: 'Today', icon: Clock },
    { id: 'week', label: '7 Days', icon: Calendar },
    { id: 'month', label: '30 Days', icon: CalendarDays },
  ];

  return (
    <CRMLayout
      title="Revenue Command Center"
      description="Unified overview of your AI Call Centre performance and operations."
    >
      <div className="space-y-8">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-card p-4 rounded-[20px] shadow-premium-card border border-[#E2E8F0] dark:border-border">
          <div className="flex bg-[#F8FAFC] dark:bg-background p-1.5 rounded-[14px] border border-[#E2E8F0] dark:border-border">
            {periodOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = period === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "bg-[#0F172A] text-white shadow-md" 
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleAutoAssignAll}
              disabled={isAssigning || isRefreshing}
              className="gap-2"
            >
              {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4 text-[#FF6B00]" />}
              Auto-Assign Leads
            </Button>
            
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing || isMetricsLoading || isFoundersLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <KPIStrip metrics={metrics} isLoading={isMetricsLoading} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column (Wider for complex charts) */}
          <div className="col-span-1 xl:col-span-2 space-y-8">
            
            {/* Revenue & Channels Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RevenueFunnel funnel={foundersData?.funnel} isLoading={isFoundersLoading} />
              <div className="space-y-8">
                <ChannelPerformance channels={foundersData?.channels} isLoading={isFoundersLoading} />
                <BotVsHumanComparison data={foundersData?.botVsHuman} isLoading={isFoundersLoading} />
              </div>
            </div>

            {/* Deep Dive Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TopIntentsChart intents={foundersData?.intents} isLoading={isFoundersLoading} />
              <LeakDetectionPanel leaks={foundersData?.leaks} isLoading={isFoundersLoading} />
            </div>

            {/* Bottom Row */}
            <AgentPerformanceTable agents={foundersData?.agents} isLoading={isFoundersLoading} />
          </div>

          {/* Right Column (Sidebar style for live feeds & health) */}
          <div className="col-span-1 space-y-8 flex flex-col">
            <AIReadinessPanel aiData={foundersData?.aiReadiness} isLoading={isFoundersLoading} />
            <div className="flex-1 min-h-[400px]">
              <ActivityFeed activities={activities} isLoading={isActivitiesLoading} />
            </div>
          </div>
        </div>

      </div>
    </CRMLayout>
  );
}
