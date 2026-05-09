import React, { useEffect } from 'react';
import { Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAutomationTrigger } from '@/hooks/useAutomationTrigger.js';

export default function AutomationTriggersManager({ conversationId }) {
  const { triggers, loadTriggers, isProcessing } = useAutomationTrigger();

  useEffect(() => {
    if (conversationId) {
      loadTriggers(conversationId);
    }
  }, [conversationId, loadTriggers]);

  // Merge local state loading indicator with database triggers visually
  if (!isProcessing && triggers.length === 0) return null;

  return (
    <div className="mx-4 mt-4 space-y-3">
      {isProcessing && (
        <div className="p-3 bg-automation-secondary border border-automation-primary/20 rounded-xl flex items-center gap-3 animate-pulse">
          <Loader2 className="h-5 w-5 text-automation-primary animate-spin" />
          <span className="text-sm font-medium text-automation-secondary-foreground">Processing automation workflow...</span>
        </div>
      )}
      
      {triggers.map((trigger) => (
        <div key={trigger.id} className="p-4 bg-automation-secondary border border-automation-primary/20 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <div className="bg-automation-primary/10 p-2 rounded-full mt-0.5 shadow-sm">
              <Zap className="h-5 w-5 text-automation-primary" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-automation-secondary-foreground tracking-tight">
                  Workflow Triggered: {trigger.workflow_type.replace(/_/g, ' ')}
                </h4>
                {trigger.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                ) : trigger.status === 'failed' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-3 w-3" /> Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Pending
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {trigger.actions.map((action, idx) => {
                  const result = trigger.results && trigger.results[action];
                  const hasError = result && result.status === 'failed';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                        hasError 
                          ? 'bg-destructive/5 border-destructive/20 text-destructive' 
                          : 'bg-background shadow-sm text-foreground/80'
                      }`}
                    >
                      {hasError ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-success/70" />}
                      {action.replace(/_/g, ' ')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}