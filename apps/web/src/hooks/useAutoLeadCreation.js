import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export function useAutoLeadCreation() {
  const [isAutoCreateEnabled, setIsAutoCreateEnabled] = useState(() => {
    return localStorage.getItem('whatsappAutoCreateEnabled') === 'true';
  });

  const toggleAutoCreate = useCallback((enabled) => {
    setIsAutoCreateEnabled(enabled);
    localStorage.setItem('whatsappAutoCreateEnabled', enabled);
    if (enabled) {
      toast.success('Auto-lead creation enabled');
    } else {
      toast.info('Auto-lead creation disabled');
    }
  }, []);

  const autoCreateLeadFromMessage = useCallback(async (webhookLog) => {
    if (!webhookLog || !webhookLog.from_number) return { success: false, error: 'No phone number' };

    try {
      // 1. Check if lead exists
      const existingLeads = await pb.collection('leads').getFullList({
        filter: `mobile = "${webhookLog.from_number}"`,
        $autoCancel: false
      });

      const messageSummary = `[${new Date().toLocaleString()}] WhatsApp: ${webhookLog.message_text || 'Media Message'}\n`;

      if (existingLeads.length > 0) {
        // 2. Update existing lead
        const lead = existingLeads[0];
        const currentNotes = lead.notes || '';
        
        await pb.collection('leads').update(lead.id, {
          notes: currentNotes + messageSummary,
          lastContactDate: new Date().toISOString()
        }, { $autoCancel: false });

        return { success: true, action: 'updated', leadId: lead.id };
      } else {
        // 3. Create new lead
        const newLead = await pb.collection('leads').create({
          name: webhookLog.from_number, 
          mobile: webhookLog.from_number,
          email: `${webhookLog.from_number.replace(/\D/g, '')}@whatsapp-lead.local`, // Required by schema
          source: 'Other', 
          status: 'New Lead',
          priority: 'Medium',
          nextFollowUpDate: new Date().toISOString(),
          notes: messageSummary,
          description: 'Auto-created from WhatsApp'
        }, { $autoCancel: false });

        // Update log to indicate lead was created
        await pb.collection('whatsapp_webhook_logs').update(webhookLog.id, {
          created_lead: true
        }, { $autoCancel: false });

        return { success: true, action: 'created', leadId: newLead.id };
      }
    } catch (error) {
      console.error('Auto lead creation failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Set up real-time listener
  useEffect(() => {
    if (!isAutoCreateEnabled) return;

    const handleNewMessage = async (e) => {
      if (e.action === 'create') {
        await autoCreateLeadFromMessage(e.record);
      }
    };

    pb.collection('whatsapp_webhook_logs').subscribe('*', handleNewMessage);

    return () => {
      pb.collection('whatsapp_webhook_logs').unsubscribe('*');
    };
  }, [isAutoCreateEnabled, autoCreateLeadFromMessage]);

  return {
    isAutoCreateEnabled,
    toggleAutoCreate,
    autoCreateLeadFromMessage
  };
}