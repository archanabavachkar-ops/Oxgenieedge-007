import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { shouldTriggerAutomation, buildAutomationPayload } from '@/utils/automationTrigger.js';

export function useAutomationTrigger() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [triggers, setTriggers] = useState([]);

  const loadTriggers = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const records = await pb.collection('automation_triggers').getFullList({
        filter: `conversation_id = "${conversationId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setTriggers(records);
    } catch (err) {
      console.error('Failed to load automation triggers', err);
    }
  }, []);

  const triggerAutomation = useCallback(async (conversationId, userId, text, intent, confidence) => {
    if (!shouldTriggerAutomation(intent, confidence)) return null;

    setIsProcessing(true);
    try {
      const payload = buildAutomationPayload(intent, text, userId, conversationId);
      
      // Save initial pending state
      let record = await pb.collection('automation_triggers').create(payload, { $autoCancel: false });
      
      const results = {};
      let hasFailures = false;

      // Execute actions
      for (const action of payload.actions) {
        try {
          const res = await executeAction(action, conversationId, userId, text, intent);
          results[action] = { status: 'success', data: res };
        } catch (actionErr) {
          console.error(`Action ${action} failed:`, actionErr);
          results[action] = { status: 'failed', error: actionErr.message };
          hasFailures = true;
        }
      }

      // Update record with results
      record = await pb.collection('automation_triggers').update(record.id, {
        status: hasFailures ? 'failed' : 'completed',
        results
      }, { $autoCancel: false });

      setTriggers(prev => [record, ...prev]);
      return record;

    } catch (err) {
      console.error('Automation trigger failed:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const executeAction = async (action, conversationId, userId, text, intent) => {
    switch (action) {
      case 'create_lead':
        return await pb.collection('leads').create({
          conversation_id: conversationId,
          user_id: userId,
          intent,
          source: 'bot_automation',
          status: 'New Order',
          priority: 'High',
          name: 'Auto Lead',
          email: 'placeholder@example.com',
          mobile: '0000000000'
        }, { $autoCancel: false });
        
      case 'assign_sales_agent':
      case 'assign_support_agent': {
        const dept = action === 'assign_sales_agent' ? 'sales' : 'support';
        const agents = await pb.collection('agents').getFullList({
          filter: `status = "available" && department = "${dept}"`,
          sort: '-priority',
          $autoCancel: false
        });
        if (agents.length > 0) {
          await pb.collection('conversations').update(conversationId, {
            assigned_agent_id: agents[0].id,
            status: 'assigned'
          }, { $autoCancel: false });
          return agents[0].id;
        }
        return null;
      }
      
      case 'create_task':
        return await pb.collection('agent_tasks').create({
          conversation_id: conversationId,
          user_id: userId,
          title: `Follow up on ${intent} inquiry`,
          description: `Auto-generated task from bot interaction: "${text}"`,
          status: 'open',
          priority: 'medium'
        }, { $autoCancel: false });

      case 'create_ticket':
        return await pb.collection('support_tickets').create({
          conversation_id: conversationId,
          user_id: userId,
          subject: `Auto Ticket: ${intent}`,
          description: text,
          status: 'open',
          priority: 'medium'
        }, { $autoCancel: false });

      case 'send_whatsapp':
        return await pb.collection('whatsapp_templates').create({
          conversation_id: conversationId,
          user_id: userId,
          template: `automated_${intent}_followup`,
          status: 'pending'
        }, { $autoCancel: false });

      case 'send_email':
        return await pb.collection('email_templates').create({
          conversation_id: conversationId,
          user_id: userId,
          template: `automated_${intent}_followup`,
          status: 'pending'
        }, { $autoCancel: false });

      case 'send_sms':
        return await pb.collection('sms_templates').create({
          conversation_id: conversationId,
          user_id: userId,
          template: `automated_${intent}_followup`,
          status: 'pending'
        }, { $autoCancel: false });

      default:
        throw new Error(`Unknown action type: ${action}`);
    }
  };

  return {
    triggers,
    isProcessing,
    loadTriggers,
    triggerAutomation
  };
}