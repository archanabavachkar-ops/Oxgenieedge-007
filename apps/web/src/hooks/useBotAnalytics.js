import { useState, useCallback, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export function useBotAnalytics() {
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    botHandled: 0,
    escalated: 0,
    escalationRate: 0,
    topIntents: [],
    conversionTriggers: 0,
    conversionsByIntent: [],
    avgConfidence: 0,
    successRate: 0,
    avgMessagesPerDay: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('week'); // today, yesterday, week, month

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range
      const now = new Date();
      let start = new Date();
      let end = new Date();
      let daysInRange = 1;

      if (dateRange === 'today') {
        start.setHours(0, 0, 0, 0);
      } else if (dateRange === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
      } else if (dateRange === 'week') {
        start.setDate(start.getDate() - 7);
        daysInRange = 7;
      } else if (dateRange === 'month') {
        start.setMonth(start.getMonth() - 1);
        daysInRange = 30;
      }

      const startStr = start.toISOString().replace('T', ' ');
      const endStr = end.toISOString().replace('T', ' ');
      const dateFilter = `created >= "${startStr}" && created <= "${endStr}"`;

      // Fetch data concurrently
      const [messages, escalations, automations] = await Promise.all([
        pb.collection('messages').getFullList({
          filter: dateFilter,
          $autoCancel: false
        }),
        pb.collection('escalations').getFullList({
          filter: dateFilter,
          $autoCancel: false
        }),
        pb.collection('automation_triggers').getFullList({
          filter: dateFilter,
          $autoCancel: false
        })
      ]);

      // Process Messages
      const totalMessages = messages.length;
      const botMessages = messages.filter(m => m.sender === 'bot' || m.sender === 'bot_engine');
      const botHandled = botMessages.length;

      // Process Intents & Confidence
      const intentCounts = {};
      let totalConfidence = 0;
      let confidenceCount = 0;

      botMessages.forEach(msg => {
        if (msg.intent_detected) {
          intentCounts[msg.intent_detected] = (intentCounts[msg.intent_detected] || 0) + 1;
        }
        if (msg.confidence_score !== undefined && msg.confidence_score !== null) {
          totalConfidence += msg.confidence_score;
          confidenceCount++;
        }
      });

      const topIntents = Object.entries(intentCounts)
        .map(([intent, count]) => ({
          intent,
          count,
          percentage: botHandled > 0 ? Math.round((count / botHandled) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

      // Process Escalations
      const escalated = escalations.length;
      const escalationRate = botHandled > 0 ? (escalated / botHandled) * 100 : 0;

      // Process Automations (Conversions)
      const completedAutomations = automations.filter(a => a.status === 'completed');
      const conversionTriggers = completedAutomations.length;

      const conversionIntentCounts = {};
      completedAutomations.forEach(auto => {
        if (auto.intent) {
          conversionIntentCounts[auto.intent] = (conversionIntentCounts[auto.intent] || 0) + 1;
        }
      });

      const conversionsByIntent = Object.entries(conversionIntentCounts)
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count);

      // Summary Stats
      const successRate = botHandled > 0 ? ((botHandled - escalated) / botHandled) * 100 : 0;
      const avgMessagesPerDay = Math.round(totalMessages / daysInRange);

      setMetrics({
        totalMessages,
        botHandled,
        escalated,
        escalationRate,
        topIntents,
        conversionTriggers,
        conversionsByIntent,
        avgConfidence,
        successRate,
        avgMessagesPerDay
      });

    } catch (err) {
      console.error('Failed to fetch bot analytics:', err);
      setError(err.message);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refresh: fetchMetrics
  };
}