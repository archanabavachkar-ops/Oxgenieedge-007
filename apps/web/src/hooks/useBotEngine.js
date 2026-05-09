import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { detectIntent, getDefaultResponse } from '@/utils/intentDetector.js';
import { toast } from 'sonner';
import { useEscalation } from './useEscalation.js';
import { useAutomationTrigger } from './useAutomationTrigger.js';

export function useBotEngine() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { escalateConversation, getEscalationStatus } = useEscalation();
  const { triggerAutomation, loadTriggers } = useAutomationTrigger();

  const loadConversationMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const records = await pb.collection('messages').getFullList({
        filter: `conversation_id = "${conversationId}"`,
        sort: 'created',
        $autoCancel: false
      });
      setMessages(records);
      
      // Also load related statuses
      getEscalationStatus(conversationId);
      loadTriggers(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  }, [getEscalationStatus, loadTriggers]);

  const respondToMessage = useCallback(async (text, conversationId = null, customerId = null, templates = []) => {
    if (!text.trim()) return null;

    const userMsgId = `temp_user_${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      content: text,
      direction: 'inbound',
      sender: 'user',
      created: new Date().toISOString()
    };
    
    // Use functional update to get the latest messages for history context
    let currentMessages = [];
    setMessages(prev => {
      currentMessages = [...prev, userMessage];
      return currentMessages;
    });
    
    setIsTyping(true);

    try {
      if (conversationId && customerId) {
        await pb.collection('messages').create({
          conversation_id: conversationId,
          customer_id: customerId,
          content: text,
          direction: 'inbound',
          channel: 'chat',
          status: 'delivered',
          message_id: `msg_${Date.now()}`,
          sender: 'user'
        }, { $autoCancel: false });
      }

      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
      
      const { intent, confidence } = detectIntent(text, templates);
      const responseText = getDefaultResponse(intent, templates);

      const botMsgId = `temp_bot_${Date.now()}`;
      const botMessage = {
        id: botMsgId,
        content: responseText,
        direction: 'outbound',
        sender: 'bot',
        intent_detected: intent,
        confidence_score: confidence,
        created: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      if (conversationId && customerId) {
        await pb.collection('messages').create({
          conversation_id: conversationId,
          customer_id: customerId,
          content: responseText,
          direction: 'outbound',
          channel: 'chat',
          status: 'delivered',
          message_id: `msg_bot_${Date.now()}`,
          sender: 'bot_engine',
          intent_detected: intent,
          confidence_score: confidence
        }, { $autoCancel: false });
        
        // 1. Check for escalation
        const escResult = await escalateConversation(conversationId, text, intent, confidence, currentMessages);
        
        // 2. If not escalated, check for automation
        if (!escResult) {
          await triggerAutomation(conversationId, customerId, text, intent, confidence);
        }
      }

      return { intent, confidence, response: responseText };
    } catch (error) {
      console.error('Bot engine error:', error);
      toast.error('Failed to process message');
      setIsTyping(false);
      return null;
    } finally {
      setIsTyping(false);
    }
  }, [escalateConversation, triggerAutomation]);

  return {
    messages,
    isLoading,
    isTyping,
    loadConversationMessages,
    respondToMessage,
    setMessages
  };
}