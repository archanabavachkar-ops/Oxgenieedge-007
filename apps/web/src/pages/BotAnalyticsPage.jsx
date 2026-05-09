import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import BotAnalyticsDashboard from '@/components/BotAnalyticsDashboard.jsx';

export default function BotAnalyticsPage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bot Analytics</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Track your AI assistant's performance, understand customer intents, and measure automation success rates.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <BotAnalyticsDashboard />

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6 flex gap-4 items-start">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Understanding Your Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-blue-800 dark:text-blue-200/80">
              <p>
                <strong className="font-semibold text-blue-950 dark:text-blue-100">Total Messages:</strong> All inbound and outbound messages across all channels in the selected period.
              </p>
              <p>
                <strong className="font-semibold text-blue-950 dark:text-blue-100">Bot Handled:</strong> Messages successfully processed and responded to by the AI engine.
              </p>
              <p>
                <strong className="font-semibold text-blue-950 dark:text-blue-100">Escalated:</strong> Conversations transferred to a human agent due to low confidence or frustration.
              </p>
              <p>
                <strong className="font-semibold text-blue-950 dark:text-blue-100">Conversions:</strong> Successful executions of automated workflows (e.g., lead creation, ticket generation).
              </p>
              <p className="md:col-span-2">
                <strong className="font-semibold text-blue-950 dark:text-blue-100">Top Intents:</strong> The most common topics or requests identified by the bot's natural language processing.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}