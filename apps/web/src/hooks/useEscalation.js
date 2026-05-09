import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { detectEscalationTrigger } from '@/utils/escalationDetector.js';
import { toast } from 'sonner';

export function useEscalation() {
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationData, setEscalationData] = useState(null);

  const getEscalationStatus = useCallback(async (conversationId) => {
    if (!conversationId) return null;
    try {
      const records = await pb.collection('escalations').getFullList({
        filter: `conversation_id = "${conversationId}"`,
        sort: '-created',
        expand: 'agent_id',
        $autoCancel: false
      });
      if (records.length > 0) {
        setEscalationData(records[0]);
        return records[0];
      }
      return null;
    } catch (err) {
      console.error('Failed to get escalation status', err);
      return null;
    }
  }, []);

  const escalateConversation = useCallback(async (conversationId, text, intent, confidence, messageHistory) => {
    if (!conversationId) return null;

    const check = detectEscalationTrigger(text, intent, confidence, messageHistory);
    
    if (!check.shouldEscalate) return null;

    setIsEscalating(true);
    try {
      // 1. Find available agent based on intent
      const department = intent === 'support' ? 'support' : 'sales';
      const availableAgents = await pb.collection('agents').getFullList({
        filter: `status = "available" && (department = "${department}" || department = "general")`,
        sort: '-priority',
        $autoCancel: false
      });

      let assignedAgent = availableAgents.length > 0 ? availableAgents[0] : null;

      // 2. Create Escalation Record
      const escalationRecord = await pb.collection('escalations').create({
        conversation_id: conversationId,
        agent_id: assignedAgent ? assignedAgent.id : null,
        original_intent: intent,
        confidence_score: confidence,
        escalation_reason: check.reason,
        triggers: check.triggers,
        severity: check.severity,
        status: assignedAgent ? 'active' : 'pending'
      }, { $autoCancel: false });

      // 3. Update conversation status
      await pb.collection('conversations').update(conversationId, {
        status: assignedAgent ? 'assigned' : 'waiting',
        assigned_agent_id: assignedAgent ? assignedAgent.id : null
      }, { $autoCancel: false });

      // 4. Create Agent Notification if assigned
      if (assignedAgent) {
        await pb.collection('escalation_notifications').create({
          agent_id: assignedAgent.id,
          type: 'escalation',
          title: 'New Conversation Escalation',
          message: `Conversation escalated: ${check.reason}`,
          conversation_id: conversationId,
          escalation_id: escalationRecord.id,
          read: false
        }, { $autoCancel: false });
      }

      // 5. Log system message
      await pb.collection('messages').create({
        conversation_id: conversationId,
        content: assignedAgent 
          ? `I've escalated this to our team. ${assignedAgent.name} will be with you shortly.`
          : `I've escalated this to our team. Someone will be with you as soon as possible.`,
        direction: 'outbound',
        channel: 'chat',
        status: 'delivered',
        message_id: `sys_esc_${Date.now()}`,
        sender: 'system'
      }, { $autoCancel: false });

      const updatedEscalation = await pb.collection('escalations').getOne(escalationRecord.id, {
        expand: 'agent_id',
        $autoCancel: false
      });

      setEscalationData(updatedEscalation);
      return updatedEscalation;

    } catch (err) {
      console.error('Escalation failed', err);
      toast.error('Failed to escalate conversation');
      return null;
    } finally {
      setIsEscalating(false);
    }
  }, []);

  return {
    isEscalating,
    escalationData,
    escalateConversation,
    getEscalationStatus
  };
}