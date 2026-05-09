import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, MessageSquare, Bot, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/dashboardCalculations.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { cn } from '@/lib/utils.js';

export default function KPIStrip({ metrics, isLoading }) {
  const cards = [
    {
      title: 'Revenue',
      value: formatCurrency(metrics.revenue.value),
      trend: metrics.revenue.trend,
      icon: DollarSign,
      color: 'text-founder-primary',
      bg: 'bg-founder-primary/10'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.value.toFixed(1)}%`,
      trend: metrics.conversionRate.trend,
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Conversations',
      value: formatNumber(metrics.conversations.value),
      trend: metrics.conversations.trend,
      icon: MessageSquare,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Bot Success',
      value: `${metrics.botSuccess.value.toFixed(1)}%`,
      trend: metrics.botSuccess.trend,
      icon: Bot,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Escalation Rate',
      value: `${metrics.escalationRate.value.toFixed(1)}%`,
      trend: -metrics.escalationRate.trend, // Reverse trend meaning (down is good)
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      reverseColors: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPositiveTrend = card.trend >= 0;
        const trendColor = card.reverseColors 
          ? (isPositiveTrend ? 'text-rose-500' : 'text-emerald-500')
          : (isPositiveTrend ? 'text-emerald-500' : 'text-rose-500');

        return (
          <div key={idx} className="bg-card rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl", card.bg)}>
                <Icon className={cn("h-5 w-5", card.color)} />
              </div>
              {!isLoading && (
                <div className={cn("flex items-center text-xs font-medium", trendColor)}>
                  {isPositiveTrend ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(card.trend).toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}