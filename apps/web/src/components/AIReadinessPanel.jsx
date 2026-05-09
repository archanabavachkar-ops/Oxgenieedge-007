
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { BrainCircuit, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import ConfidenceBadge from './ConfidenceBadge.jsx';

export default function AIReadinessPanel({ aiData, isLoading }) {
  if (isLoading) {
    return (
      <Card className="h-[250px]">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full"/>
        </CardContent>
      </Card>
    );
  }
  
  if (!aiData) return null;

  // Safely extract numeric values with defaults to prevent crashes
  const avgConfidence = typeof aiData.avgConfidence === 'number' ? aiData.avgConfidence : 0;
  const lowConfPercentage = typeof aiData.lowConfPercentage === 'number' ? aiData.lowConfPercentage : 0;
  const unknownCount = typeof aiData.unknownCount === 'number' ? aiData.unknownCount : 0;

  return (
    <Card className="shadow-sm border-border/50 bg-gradient-to-b from-card to-bot-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-bot-primary" />
          AI Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Avg Confidence</p>
              <ConfidenceBadge confidence={avgConfidence} showLabel={false} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Low Conf. Messages</p>
              <p className="text-lg font-bold text-warning-foreground">
                {lowConfPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-background/60 p-4 rounded-xl border border-border/50 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-bot-primary">
              <Lightbulb className="h-4 w-4" /> Improvement Insight
            </div>
            {unknownCount > 20 ? (
              <p className="text-muted-foreground">
                <span className="font-bold text-foreground">{unknownCount} queries</span> went unrecognized. We recommend reviewing transcripts to train new intents.
              </p>
            ) : lowConfPercentage > 15 ? (
              <p className="text-muted-foreground">
                Bot is struggling with accuracy. Consider adding more training phrases to your Top Intents.
              </p>
            ) : (
              <p className="text-muted-foreground">
                AI Engine is performing optimally. Hand-offs are mostly intentional logic rather than failure.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
