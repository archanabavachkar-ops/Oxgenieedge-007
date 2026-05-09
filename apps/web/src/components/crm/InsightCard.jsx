import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Lightbulb, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const InsightCard = ({ insight, impact, type = 'opportunity', actionLabel, onAction, timestamp }) => {
  const getImpactStyles = () => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const Icon = type === 'warning' ? AlertTriangle : type === 'success' ? CheckCircle : Lightbulb;

  return (
    <Card className="card-shadow card-hover overflow-hidden group">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant="outline" className={cn("capitalize", getImpactStyles())}>
            {impact} Impact
          </Badge>
        </div>
        
        <p className="font-semibold text-foreground text-lg mb-4 flex-1">
          {insight}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className="text-primary hover:text-primary hover:bg-primary/10 -mr-2"
          >
            {actionLabel} <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;