import React from 'react';
import { Sparkles, Target, CalendarDays, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CallSummary = ({ summary = '', keyPoints = [], sentiment = 'neutral', actionItems = [], followUpNotes = '' }) => {
  
  const getSentimentConfig = (val) => {
    switch (val?.toLowerCase()) {
      case 'positive':
        return { icon: ThumbsUp, color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'negative':
        return { icon: ThumbsDown, color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20' };
      default:
        return { icon: Minus, color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20' };
    }
  };

  const sentimentConfig = getSentimentConfig(sentiment);
  const SentimentIcon = sentimentConfig.icon;

  return (
    <Card className="h-full border-border shadow-sm flex flex-col">
      <CardHeader className="p-4 border-b bg-muted/10 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Summary
        </CardTitle>
        <Badge variant="outline" className={`capitalize ${sentimentConfig.color} flex items-center gap-1 pr-2.5`}>
          <SentimentIcon className="h-3 w-3" />
          {sentiment || 'Neutral'}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6 overflow-y-auto">
        {!summary ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">Summary generation pending or unavailable.</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground tracking-tight">Overview</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary}
              </p>
            </div>

            {/* Key Points */}
            {keyPoints && keyPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" /> Key Points
                </h4>
                <ul className="space-y-1.5 ml-1">
                  {keyPoints.map((point, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {actionItems && actionItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground tracking-tight">Action Items</h4>
                <div className="space-y-2">
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/10 rounded-md p-2.5 text-sm flex items-start gap-2">
                      <div className="h-4 w-4 rounded-sm border border-primary/30 flex items-center justify-center shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Notes */}
            {followUpNotes && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Next Steps
                </h4>
                <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border border-border/50">
                  {followUpNotes}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CallSummary;