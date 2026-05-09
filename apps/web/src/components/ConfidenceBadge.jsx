import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import { cn } from '@/lib/utils.js';

export default function ConfidenceBadge({ confidence = 0, showLabel = false, className }) {
  // Determine level and styling based on confidence score (0 to 1)
  let level = 'low';
  let Icon = HelpCircle;
  let colorClass = 'bg-destructive/10 text-destructive border-destructive/20';
  let description = 'Low confidence. Bot may struggle to understand.';

  if (confidence >= 0.7) {
    level = 'high';
    Icon = CheckCircle2;
    colorClass = 'bg-success/10 text-success border-success/20';
    description = 'High confidence. Bot clearly understood the intent.';
  } else if (confidence >= 0.5) {
    level = 'medium';
    Icon = AlertCircle;
    colorClass = 'bg-warning/10 text-warning-foreground border-warning/30';
    description = 'Medium confidence. Bot is reasonably sure.';
  }

  const percentage = Math.round(confidence * 100);

  const badgeContent = (
    <Badge 
      variant="outline" 
      className={cn("flex items-center gap-1 text-[10px] h-5 px-1.5 font-medium shadow-sm", colorClass, className)}
    >
      <Icon className="h-3 w-3" />
      <span>{percentage}%</span>
      {showLabel && <span className="hidden sm:inline ml-0.5 opacity-80">confidence</span>}
    </Badge>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex cursor-help">
            {badgeContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}