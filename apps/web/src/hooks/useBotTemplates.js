import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export function useBotTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('bot_templates').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setTemplates(records);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load bot templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const record = await pb.collection('bot_templates').create(data, { $autoCancel: false });
      setTemplates(prev => [record, ...prev]);
      toast.success('Template created successfully');
      return record;
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const record = await pb.collection('bot_templates').update(id, data, { $autoCancel: false });
      setTemplates(prev => prev.map(t => t.id === id ? record : t));
      toast.success('Template updated successfully');
      return record;
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await pb.collection('bot_templates').delete(id, { $autoCancel: false });
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    templates,
    isLoading,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}