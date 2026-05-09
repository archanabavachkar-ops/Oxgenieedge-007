import React, { useEffect, useState } from 'react';
import { AlertTriangle, UserCheck, Clock } from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation.js';

export default function EscalationPanel({ conversationId }) {
  const { escalationData, getEscalationStatus } = useEscalation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId) {
      getEscalationStatus(conversationId).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [conversationId, getEscalationStatus]);

  if (loading || !escalationData) return null;

  return (
    <div className="mx-4 mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
      <div className="flex items-start gap-3">
        <div className="bg-warning/20 p-2 rounded-full mt-0.5">
          <AlertTriangle className="h-5 w-5 text-warning-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-warning-foreground tracking-tight">Conversation Escalated</h4>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning-foreground">
              Severity {escalationData.severity}
            </span>
          </div>
          
          <p className="text-sm text-warning-foreground/90">
            {escalationData.escalation_reason}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 text-xs font-medium text-warning-foreground/80">
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md shadow-sm">
              <UserCheck className="h-3.5 w-3.5" />
              {escalationData.expand?.agent_id ? (
                <span>Assigned to: {escalationData.expand.agent_id.name}</span>
              ) : (
                <span>Waiting for agent assignment...</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{new Date(escalationData.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}