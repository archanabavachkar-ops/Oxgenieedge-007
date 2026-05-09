import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const LeadPrioritizationList = ({ leads = [], onAction }) => {
  if (leads.length === 0) return null;

  return (
    <div className="space-y-4">
      {leads.map((lead, index) => (
        <div key={lead.id || index} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-300">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{index + 1}
          </div>
          
          <Avatar className="w-10 h-10 border border-border">
            <AvatarFallback className={cn(
              "text-white", 
              index % 3 === 0 ? "bg-blue-500" : index % 3 === 1 ? "bg-emerald-500" : "bg-primary"
            )}>
              {lead.name?.substring(0, 2).toUpperCase() || 'LD'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{lead.name}</h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs border-0">
                Score: {lead.score}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {lead.reason}
            </p>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">{lead.lastActivity}</span>
            <Button size="sm" onClick={() => onAction(lead)} className="h-8">
              Take Action <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadPrioritizationList;