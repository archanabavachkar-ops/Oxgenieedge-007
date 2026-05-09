
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { calculateRateLimitStatus } from '@/utils/webhookUtils';

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock rate limit data since it's tracked in memory on the Express server, not in PB
  const [rateLimits] = useState({
    facebook: { count: Math.floor(Math.random() * 30), limit: 100, window: 15 },
    whatsapp: { count: Math.floor(Math.random() * 45), limit: 50, window: 15 }
  });

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const records = await pb.collection('integrations').getFullList({
          filter: 'type = "facebook" || type = "whatsapp"',
          $autoCancel: false
        });
        setIntegrations(records);
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  const getIntegrationData = (type) => {
    return integrations.find(i => i.type === type) || { status: 'disconnected', last_sync: null };
  };

  const renderStatusCard = (title, type, limits) => {
    const data = getIntegrationData(type);
    const isConnected = data.status === 'connected';
    const rateStatus = calculateRateLimitStatus(limits.count, limits.limit, limits.window);
    
    let healthColor = 'text-emerald-500';
    let HealthIcon = CheckCircle2;
    
    if (!isConnected) {
      healthColor = 'text-slate-400';
      HealthIcon = XCircle;
    } else if (rateStatus.status === 'critical' || data.status === 'error') {
      healthColor = 'text-rose-500';
      HealthIcon = AlertCircle;
    } else if (rateStatus.status === 'warning') {
      healthColor = 'text-amber-500';
      HealthIcon = Activity;
    }

    return (
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              <HealthIcon className={`w-5 h-5 ${healthColor}`} />
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
              {isConnected ? 'Connected' : 'Not Configured'}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5" />
            Last received: {data.last_sync ? new Date(data.last_sync).toLocaleString() : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">Rate Limit Usage</span>
              <span className={
                rateStatus.status === 'critical' ? 'text-rose-500' : 
                rateStatus.status === 'warning' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'
              }>
                {rateStatus.text}
              </span>
            </div>
            <Progress 
              value={rateStatus.percentage} 
              className="h-2"
              indicatorClassName={
                rateStatus.status === 'critical' ? 'bg-rose-500' : 
                rateStatus.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
              Resets every {limits.window} minutes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800/50" />
        <Card className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800/50" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderStatusCard('Facebook Lead Ads', 'facebook', rateLimits.facebook)}
      {renderStatusCard('WhatsApp Business', 'whatsapp', rateLimits.whatsapp)}
    </div>
  );
}
