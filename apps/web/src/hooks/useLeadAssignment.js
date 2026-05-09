
import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export function useLeadAssignment() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnassignedLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiServerClient.fetch(`/leads/unassigned?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch unassigned leads');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      return { items: [], totalItems: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignLead = useCallback(async (leadId, userId, reason) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch(`/leads/${leadId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      if (!response.ok) throw new Error('Failed to assign lead');
      toast.success('Lead assigned successfully');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkAssignLeads = useCallback(async (leadIds, userId, reason) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch(`/leads/bulk-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, userId, reason })
      });
      if (!response.ok) throw new Error('Failed to bulk assign leads');
      toast.success('Leads assigned successfully');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchUnassignedLeads, assignLead, bulkAssignLeads, isLoading };
}
