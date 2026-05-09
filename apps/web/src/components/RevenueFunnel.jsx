import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Filter } from 'lucide-react';
import { formatNumber } from '@/utils/dashboardCalculations.js';

export default function RevenueFunnel({ funnel, isLoading }) {
  if (isLoading) return <Card className="h-[400px]"><CardContent className="p-6 h-full flex flex-col justify-center gap-4"><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-4/5 mx-auto"/><Skeleton className="h-10 w-3/5 mx-auto"/></CardContent></Card>;
  
  if (!funnel || funnel.length === 0) return null;

  const maxCount = Math.max(...funnel.map(f => f.count));

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5 text-founder-primary" />
          Revenue Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          {funnel.map((stage, idx) => {
            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const dropoff = idx > 0 && funnel[idx-1].count > 0 
              ? ((funnel[idx-1].count - stage.count) / funnel[idx-1].count * 100).toFixed(1)
              : 0;

            return (
              <div key={idx} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-3 right-0 text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="text-destructive font-medium">-{dropoff}%</span> drop-off
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-32 shrink-0 text-sm font-medium text-right text-muted-foreground">
                    {stage.name}
                  </div>
                  <div className="flex-1 h-10 bg-muted/40 rounded-lg relative overflow-hidden flex items-center">
                    <div 
                      className="absolute top-0 left-0 h-full bg-founder-primary/80 transition-all duration-700 ease-out rounded-lg"
                      style={{ width: `${width}%` }}
                    />
                    <span className="relative z-10 pl-3 text-sm font-bold text-foreground">
                      {formatNumber(stage.count)}
                    </span>
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