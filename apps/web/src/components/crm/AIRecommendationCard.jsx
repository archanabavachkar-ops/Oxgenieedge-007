import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Sparkles, ArrowRight } from 'lucide-react';

const AIRecommendationCard = ({ title, confidence, reasoning, actionText, onAction }) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-orange-50/30 dark:to-orange-950/10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {title}
          </h4>
          <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(confidence * 100)}% Match
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {reasoning}
        </p>
        <Button size="sm" variant="secondary" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={onAction}>
          {actionText} <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationCard;