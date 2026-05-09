import React from 'react';
import { RefreshCw, MessageSquare, Bot, AlertTriangle, Zap, Activity, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useBotAnalytics } from '@/hooks/useBotAnalytics.js';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import { cn } from '@/lib/utils.js';

export default function BotAnalyticsDashboard() {
  const { metrics, isLoading, dateRange, setDateRange, refresh } = useBotAnalytics();

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: '7 Days' },
    { id: 'month', label: '30 Days' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bot Analytics</h2>
          <p className="text-sm text-muted-foreground">Monitor AI performance and conversation metrics</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
            {ranges.map(range => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                  dateRange === range.id 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refresh} 
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <p className="text-3xl font-bold">{metrics.totalMessages.toLocaleString()}</p>
                )}
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Bot Handled</p>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <p className="text-3xl font-bold">{metrics.botHandled.toLocaleString()}</p>
                )}
              </div>
              <div className="p-2 bg-bot-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-bot-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning/5 border-warning/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Escalated</p>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-warning-foreground">{metrics.escalated.toLocaleString()}</p>
                    <span className="text-sm font-medium text-warning-foreground/70">
                      ({metrics.escalationRate.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 bg-warning/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-automation-primary/5 border-automation-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <p className="text-3xl font-bold text-automation-primary">{metrics.conversionTriggers.toLocaleString()}</p>
                )}
              </div>
              <div className="p-2 bg-automation-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-automation-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Intents */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Top Intents
            </CardTitle>
            <CardDescription>Most frequent topics identified by the bot</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : metrics.topIntents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No intent data available for this period.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {metrics.topIntents.map((intent, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{intent.intent.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">{intent.count} ({intent.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${intent.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversions by Intent */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-automation-primary" />
              Conversions by Intent
            </CardTitle>
            <CardDescription>Automations successfully triggered per topic</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : metrics.conversionsByIntent.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No conversions recorded for this period.</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {metrics.conversionsByIntent.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-automation-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-automation-primary" />
                      </div>
                      <span className="font-medium capitalize">{item.intent.replace(/_/g, ' ')}</span>
                    </div>
                    <Badge variant="secondary" className="bg-background shadow-sm">
                      {item.count} triggers
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="shadow-sm bg-muted/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-border/50">
            <div className="space-y-1 px-4 first:pl-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Messages/Day</p>
              {isLoading ? <Skeleton className="h-6 w-16" /> : (
                <p className="text-xl font-semibold">{metrics.avgMessagesPerDay}</p>
              )}
            </div>
            <div className="space-y-1 px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</p>
              {isLoading ? <Skeleton className="h-6 w-16" /> : (
                <p className="text-xl font-semibold text-success">{metrics.successRate.toFixed(1)}%</p>
              )}
            </div>
            <div className="space-y-1 px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
              {isLoading ? <Skeleton className="h-6 w-16" /> : (
                <p className="text-xl font-semibold text-automation-primary">
                  {metrics.botHandled > 0 ? ((metrics.conversionTriggers / metrics.botHandled) * 100).toFixed(1) : 0}%
                </p>
              )}
            </div>
            <div className="space-y-1 px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Confidence</p>
              {isLoading ? <Skeleton className="h-6 w-16" /> : (
                <div className="pt-1">
                  <ConfidenceBadge confidence={metrics.avgConfidence} showLabel={false} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}