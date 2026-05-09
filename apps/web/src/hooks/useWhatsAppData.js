import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useWhatsAppData = () => {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState(null);

  const fetchWhatsAppSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const records = await pb.collection('whatsapp_settings').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setSettings(records[0] || null);
    } catch (err) {
      console.error('Error fetching WhatsApp settings:', err);
      setError(err.message);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const fetchWhatsAppLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const records = await pb.collection('whatsapp_webhook_logs').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setLogs(records);
    } catch (err) {
      console.error('Error fetching WhatsApp logs:', err);
      setError(err.message);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchWhatsAppSettings();
    fetchWhatsAppLogs();

    // Real-time subscriptions
    pb.collection('whatsapp_settings').subscribe('*', (e) => {
      if (e.action === 'create' || e.action === 'update') {
        setSettings(e.record);
      } else if (e.action === 'delete') {
        setSettings(null);
      }
    });

    pb.collection('whatsapp_webhook_logs').subscribe('*', (e) => {
      if (e.action === 'create') {
        setLogs((prev) => [e.record, ...prev]);
      } else if (e.action === 'update') {
        setLogs((prev) => prev.map(log => log.id === e.record.id ? e.record : log));
      } else if (e.action === 'delete') {
        setLogs((prev) => prev.filter(log => log.id !== e.record.id));
      }
    });

    return () => {
      pb.collection('whatsapp_settings').unsubscribe('*');
      pb.collection('whatsapp_webhook_logs').unsubscribe('*');
    };
  }, [fetchWhatsAppSettings, fetchWhatsAppLogs]);

  const createLeadFromMessage = async (messageData, leadData) => {
    try {
      const newLead = await pb.collection('leads').create({
        name: leadData.name || 'WhatsApp Lead',
        email: leadData.email || '',
        mobile: messageData.from_number,
        description: leadData.notes || messageData.message_text,
        source: 'Other', // Using 'Other' as 'WhatsApp' isn't in the schema enum
        status: 'New Lead',
        priority: 'Medium',
        nextFollowUpDate: new Date().toISOString(),
      }, { $autoCancel: false });

      // Mark log as processed
      await pb.collection('whatsapp_webhook_logs').update(messageData.id, {
        created_lead: true,
        status: 'processed'
      }, { $autoCancel: false });

      toast.success('Lead created successfully');
      return newLead;
    } catch (err) {
      console.error('Error creating lead:', err);
      toast.error('Failed to create lead');
      throw err;
    }
  };

  return {
    settings,
    logs,
    loadingSettings,
    loadingLogs,
    error,
    fetchWhatsAppSettings,
    fetchWhatsAppLogs,
    createLeadFromMessage
  };
};