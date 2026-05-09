
import { useState, useCallback, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { getDateRange, calculateRevenue, calculateTrendPercentage } from '@/utils/dashboardCalculations.js';

const DEFAULT_METRICS = {
  revenue: { value: 0, trend: 0 },
  conversionRate: { value: 0, trend: 0 },
  conversations: { value: 0, trend: 0 },
  botSuccess: { value: 0, trend: 0 },
  escalationRate: { value: 0, trend: 0 }
};

export function useDashboardMetrics(period = 'week') {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const { start, end, prevStart, prevEnd } = getDateRange(period);
      
      const currentFilter = `created >= "${start}" && created <= "${end}"`;
      const prevFilter = `created >= "${prevStart}" && created <= "${prevEnd}"`;

      // Helper to safely fetch collections
      const fetchSafe = async (collection, filter) => {
        try {
          return await pb.collection(collection).getFullList({ filter, $autoCancel: false });
        } catch (error) {
          console.warn(`Failed to fetch ${collection} for metrics:`, error.message);
          return [];
        }
      };

      // Fetch Deals for Revenue
      const currentDeals = await fetchSafe('deals', currentFilter);
      const prevDeals = await fetchSafe('deals', prevFilter);

      const currentRev = calculateRevenue(currentDeals.filter(d => d.stage === 'Won' || d.status === 'won'));
      const prevRev = calculateRevenue(prevDeals.filter(d => d.stage === 'Won' || d.status === 'won'));

      // Fetch Conversations
      const currentConv = await fetchSafe('conversations', currentFilter);
      const prevConv = await fetchSafe('conversations', prevFilter);

      // Fetch Escalations
      const currentEsc = await fetchSafe('escalations', currentFilter);
      const prevEsc = await fetchSafe('escalations', prevFilter);

      // Calculate base metrics
      const currentWonDeals = currentDeals.filter(d => d.stage === 'Won' || d.status === 'won').length;
      const prevWonDeals = prevDeals.filter(d => d.stage === 'Won' || d.status === 'won').length;

      const currentConvRate = currentConv.length ? (currentWonDeals / currentConv.length) * 100 : 0;
      const prevConvRate = prevConv.length ? (prevWonDeals / prevConv.length) * 100 : 0;

      const currentEscRate = currentConv.length ? (currentEsc.length / currentConv.length) * 100 : 0;
      const prevEscRate = prevConv.length ? (prevEsc.length / prevConv.length) * 100 : 0;

      const currentBotSuccess = currentConv.length ? 100 - currentEscRate : 0;
      const prevBotSuccess = prevConv.length ? 100 - prevEscRate : 0;

      setMetrics({
        revenue: { value: currentRev, trend: calculateTrendPercentage(currentRev, prevRev) },
        conversionRate: { value: currentConvRate, trend: calculateTrendPercentage(currentConvRate, prevConvRate) },
        conversations: { value: currentConv.length, trend: calculateTrendPercentage(currentConv.length, prevConv.length) },
        botSuccess: { value: currentBotSuccess, trend: calculateTrendPercentage(currentBotSuccess, prevBotSuccess) },
        escalationRate: { value: currentEscRate, trend: calculateTrendPercentage(currentEscRate, prevEscRate) }
      });
    } catch (error) {
      console.error('Critical error fetching dashboard metrics:', error);
      setMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, refresh: fetchMetrics };
}
