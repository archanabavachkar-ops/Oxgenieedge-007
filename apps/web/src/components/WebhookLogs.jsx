
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { formatWebhookLog } from '@/utils/webhookUtils';

export default function WebhookLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      let filterStr = '';
      if (filter === 'facebook') filterStr = 'endpoint ~ "facebook"';
      if (filter === 'whatsapp') filterStr = 'endpoint ~ "whatsapp"';

      const records = await pb.collection('webhook_logs').getList(1, 20, {
        sort: '-timestamp',
        filter: filterStr,
        $autoCancel: false
      });

      setLogs(records.items.map(formatWebhookLog));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch webhook logs:', err);
      setError('Failed to load recent events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <Card className="h-full flex flex-col shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Events
            </CardTitle>
            <CardDescription>Live feed of incoming webhooks</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
            <Tabs value={filter} onValueChange={setFilter} className="w-[240px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="facebook">FB</TabsTrigger>
                <TabsTrigger value="whatsapp">WA</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] w-full">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
              <AlertCircle className="w-8 h-8 mb-2 text-rose-400" />
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
              <Activity className="w-8 h-8 mb-2 opacity-20" />
              <p>No events yet</p>
              <p className="text-sm opacity-70">Waiting for incoming webhooks...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.source}
                      </Badge>
                      <span className="text-xs text-slate-500">{log.timestamp}</span>
                    </div>
                    <Badge 
                      variant={log.status === 'success' ? 'default' : 'destructive'}
                      className={log.status === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-mono truncate bg-slate-100 dark:bg-slate-950 p-2 rounded-md">
                    {log.preview}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
