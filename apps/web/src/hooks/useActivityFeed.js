
import { useState, useCallback, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export function useActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      // Helper to safely fetch collections without crashing the whole feed
      const fetchSafe = async (collection, options) => {
        try {
          return await pb.collection(collection).getList(1, 10, options);
        } catch (error) {
          console.warn(`Failed to fetch ${collection} for activity feed:`, error.message);
          return { items: [] };
        }
      };

      // Fetch recent records across collections to simulate unified feed
      const [leads, deals, escalations] = await Promise.all([
        fetchSafe('leads', { sort: '-created', $autoCancel: false }),
        fetchSafe('deals', { sort: '-created', $autoCancel: false }),
        fetchSafe('escalations', { sort: '-created', expand: 'agent_id', $autoCancel: false })
      ]);

      const formatted = [
        ...(leads?.items || []).map(l => ({
          id: `lead-${l.id}`,
          type: 'lead',
          title: 'New Lead Captured',
          description: `${l.name} from ${l.source || 'Website'}`,
          timestamp: new Date(l.created).getTime()
        })),
        ...(deals?.items || []).map(d => ({
          id: `deal-${d.id}`,
          type: 'deal',
          title: `Deal ${d.stage === 'Won' ? 'Won' : 'Updated'}`,
          description: `${d.title || d.name || 'Unnamed Deal'} - $${d.value || 0}`,
          timestamp: new Date(d.created).getTime()
        })),
        ...(escalations?.items || []).map(e => ({
          id: `esc-${e.id}`,
          type: 'escalation',
          title: 'Conversation Escalated',
          description: `Assigned to ${e.expand?.agent_id?.name || 'Queue'}. Reason: ${e.escalation_reason || 'Unknown'}`,
          timestamp: new Date(e.created).getTime()
        }))
      ];

      formatted.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(formatted.slice(0, 15));
    } catch (error) {
      console.error('Critical failure in activity feed fetch:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  return { activities, isLoading };
}
