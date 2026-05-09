import React, { useState } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

import { useDashboardMetrics } from '@/hooks/useDashboardMetrics.js';
import { useFoundersDashboard } from '@/hooks/useFoundersDashboard.js';
import { useActivityFeed } from '@/hooks/useActivityFeed.js';

import KPIStrip from '@/components/KPIStrip.jsx';
import RevenueFunnel from '@/components/RevenueFunnel.jsx';
import BotVsHumanComparison from '@/components/BotVsHumanComparison.jsx';
import ChannelPerformance from '@/components/ChannelPerformance.jsx';
import TopIntentsChart from '@/components/TopIntentsChart.jsx';
import LeakDetectionPanel from '@/components/LeakDetectionPanel.jsx';
import AgentPerformanceTable from '@/components/AgentPerformanceTable.jsx';
import AIReadinessPanel from '@/components/AIReadinessPanel.jsx';
import ActivityFeed from '@/components/ActivityFeed.jsx';

export default function FoundersDashboardPage() {
  const [period, setPeriod] = useState('week'); // today, week, month

  const { metrics, isLoading: isMetricsLoading, refresh: refreshMetrics } = useDashboardMetrics(period);
  const { data: dashData, isLoading: isDashLoading, refresh: refreshDash } = useFoundersDashboard(period);
  const { activities, isLoading: isFeedLoading } = useActivityFeed();

  const handleRefresh = () => {
    refreshMetrics();
    refreshDash();
  };

  const isLoading = isMetricsLoading || isDashLoading;

  return (
    <div className="min-h-[100dvh] bg-background/50 pb-20">
      
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-founder-primary/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-founder-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Founders Dashboard</h1>
                <p className="text-sm text-muted-foreground">Revenue Command Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                {['today', 'week', 'month'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize whitespace-nowrap",
                      period === p 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : p}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Strip */}
        <KPIStrip metrics={metrics} isLoading={isMetricsLoading} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Charts & Tables */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RevenueFunnel funnel={dashData.funnel} isLoading={isDashLoading} />
              <div className="space-y-6">
                <LeakDetectionPanel leaks={dashData.leaks} isLoading={isDashLoading} />
                <TopIntentsChart intents={dashData.intents} isLoading={isDashLoading} />
              </div>
            </div>
            
            <ChannelPerformance channels={dashData.channels} isLoading={isDashLoading} />
            <BotVsHumanComparison data={dashData.botVsHuman} isLoading={isDashLoading} />
            <AgentPerformanceTable agents={dashData.agents} isLoading={isDashLoading} />
          </div>

          {/* Right Column - Feed & AI Health */}
          <div className="space-y-6 flex flex-col">
            <AIReadinessPanel aiData={dashData.aiReadiness} isLoading={isDashLoading} />
            <div className="flex-1 min-h-[500px]">
              <ActivityFeed activities={activities} isLoading={isFeedLoading} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}