
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { generateWebhookUrl, copyToClipboard } from '@/utils/webhookUtils';
import IntegrationStatus from '@/components/IntegrationStatus';
import WebhookLogs from '@/components/WebhookLogs';
import WebhookTestPanel from '@/components/WebhookTestPanel';

export default function WebhookConfigPage() {
  const endpoints = {
    facebook: generateWebhookUrl('/integrations/facebook/webhook'),
    whatsappPost: generateWebhookUrl('/integrations/whatsapp/webhook'),
    whatsappGet: generateWebhookUrl('/integrations/whatsapp/webhook'),
  };

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Webhook Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-3xl text-lg">
            Manage and test incoming webhooks for your external integrations. Ensure your endpoints are correctly configured in the respective developer portals.
          </p>
        </div>

        {/* Status Overview */}
        <IntegrationStatus />

        {/* Configuration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Facebook Config */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Facebook Lead Ads</CardTitle>
                  <CardDescription>Configure in Meta App Dashboard</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                  100 req / 15m
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Callback URL (POST)</label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-md text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap border border-slate-200 dark:border-slate-800">
                    {endpoints.facebook}
                  </code>
                  <Button variant="secondary" size="icon" onClick={() => handleCopy(endpoints.facebook, 'Facebook URL')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Setup Instructions
                </h4>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside ml-1">
                  <li>Go to your Meta App Dashboard &gt; Webhooks.</li>
                  <li>Select <strong>Page</strong> from the dropdown and click Subscribe to this object.</li>
                  <li>Paste the Callback URL above.</li>
                  <li>Enter your configured Verify Token.</li>
                  <li>Subscribe to the <strong>leadgen</strong> field.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Config */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">WhatsApp Business</CardTitle>
                  <CardDescription>Configure in Meta App Dashboard</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                  50 req / 15m
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Callback URL (POST & GET)</label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-md text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap border border-slate-200 dark:border-slate-800">
                      {endpoints.whatsappPost}
                    </code>
                    <Button variant="secondary" size="icon" onClick={() => handleCopy(endpoints.whatsappPost, 'WhatsApp URL')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Used for both verification (GET) and receiving messages (POST).</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Setup Instructions
                </h4>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside ml-1">
                  <li>Go to Meta App Dashboard &gt; WhatsApp &gt; Configuration.</li>
                  <li>Click Edit under Webhook.</li>
                  <li>Paste the Callback URL above.</li>
                  <li>Enter your configured Verify Token.</li>
                  <li>Click Manage and subscribe to <strong>messages</strong>.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Testing and Logs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WebhookTestPanel />
          <WebhookLogs />
        </div>

      </div>
    </div>
  );
}
