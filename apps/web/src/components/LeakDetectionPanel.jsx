import React from 'react';
import { ShieldAlert, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { cn } from '@/lib/utils.js';

export default function LeakDetectionPanel({ leaks, isLoading }) {
  if (isLoading) return <Card className="h-[250px]"><CardContent className="p-6"><Skeleton className="h-20 w-full mb-2"/><Skeleton className="h-20 w-full"/></CardContent></Card>;

  return (
    <Card className="shadow-sm border-border/50 bg-gradient-to-b from-card to-destructive/5 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          Pipeline Leaks Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaks && leaks.length > 0 ? (
          <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {leaks.map((leak) => (
              <div 
                key={leak.id} 
                className={cn(
                  "p-3 rounded-xl border flex items-start gap-3",
                  leak.severity === 'high' 
                    ? "bg-destructive/10 border-destructive/20 text-destructive" 
                    : "bg-warning/10 border-warning/20 text-warning-foreground"
                )}
              >
                {leak.severity === 'high' ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="font-semibold text-sm">{leak.title}</h4>
                  <p className="text-xs mt-1 opacity-90">{leak.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-success/50 mb-2" />
            <p className="text-sm">No critical leaks detected in the current period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}