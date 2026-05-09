import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';

export default function TopIntentsChart({ intents, isLoading }) {
  if (isLoading) return <Card className="h-[250px]"><CardContent className="p-6"><Skeleton className="h-40 w-full"/></CardContent></Card>;
  if (!intents || intents.length === 0) return null;

  const maxCount = Math.max(...intents.map(i => i.count));

  return (
    <Card className="shadow-sm border-border/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-founder-primary" />
          Top AI Intents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          {intents.map((intent, idx) => {
            const width = maxCount > 0 ? (intent.count / maxCount) * 100 : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm items-end">
                  <span className="font-medium capitalize truncate pr-4">{intent.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground">{intent.count} vol</span>
                    <span className="text-success font-medium w-12 text-right">{intent.conversion.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-founder-primary transition-all duration-500 rounded-full" 
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}