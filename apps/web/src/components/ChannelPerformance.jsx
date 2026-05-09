import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Smartphone, Mail, MessageSquare, Phone, Globe } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/dashboardCalculations.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { cn } from '@/lib/utils.js';

const CHANNEL_ICONS = {
  'sms': Smartphone,
  'whatsapp': MessageSquare,
  'email': Mail,
  'chat': Globe,
  'call': Phone,
};

export default function ChannelPerformance({ channels, isLoading }) {
  if (isLoading) return <Card className="h-[250px]"><CardContent className="p-6 flex gap-4"><Skeleton className="flex-1 h-32"/><Skeleton className="flex-1 h-32"/></CardContent></Card>;
  if (!channels || channels.length === 0) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Channel Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {channels.slice(0, 4).map((channel, idx) => {
            const Icon = CHANNEL_ICONS[channel.name.toLowerCase()] || Globe;
            return (
              <div key={idx} className="p-4 rounded-xl border bg-card flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-1.5 rounded-md text-white shadow-sm", `bg-channel-${channel.name.toLowerCase()}`)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm capitalize truncate">{channel.name}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold">{formatNumber(channel.count)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Vol</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-success font-medium">{channel.convRate.toFixed(1)}% cvr</span>
                    <span className="text-muted-foreground">{formatCurrency(channel.revenue)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}