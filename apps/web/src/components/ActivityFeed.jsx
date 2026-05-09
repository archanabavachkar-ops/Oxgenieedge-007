import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Activity, Target, Phone, AlertTriangle, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { cn } from '@/lib/utils.js';

export default function ActivityFeed({ activities, isLoading }) {
  if (isLoading) return <Card className="h-[400px]"><CardContent className="p-6"><Skeleton className="h-full w-full"/></CardContent></Card>;

  const getIcon = (type) => {
    switch (type) {
      case 'lead': return <Target className="h-4 w-4 text-blue-500" />;
      case 'deal': return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'escalation': return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'call': return <Phone className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-sm border-border/50 h-full flex flex-col">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-founder-primary" />
            Live Activity
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {activities.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">No recent activity.</p>
            ) : (
              activities.map((item, idx) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {getIcon(item.type)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <time className="text-[10px] font-medium text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}