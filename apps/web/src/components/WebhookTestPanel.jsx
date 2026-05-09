
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Play, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { sendTestPayload } from '@/utils/webhookUtils';

const SAMPLE_PAYLOADS = {
  facebook: {
    object: "page",
    entry: [
      {
        id: "1234567890",
        time: Math.floor(Date.now() / 1000),
        changes: [
          {
            field: "leadgen",
            value: {
              ad_id: "444444444",
              form_id: "555555555",
              leadgen_id: "666666666",
              created_time: Math.floor(Date.now() / 1000),
              page_id: "1234567890",
              adgroup_id: "777777777",
              field_data: [
                { name: "full_name", values: ["Test User"] },
                { name: "email", values: ["test@example.com"] },
                { name: "phone_number", values: ["+1234567890"] },
                { name: "campaign_name", values: ["Summer Promo 2026"] }
              ]
            }
          }
        ]
      }
    ]
  },
  whatsapp: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "16505551111",
                phone_number_id: "123456123"
              },
              contacts: [
                {
                  profile: { name: "Test Contact" },
                  wa_id: "16315551234"
                }
              ],
              messages: [
                {
                  from: "16315551234",
                  id: "wamid.HBgLMTYzMTU1NTEyMzQ...",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: "Hello, I am interested in your services." },
                  type: "text"
                }
              ]
            },
            field: "messages"
          }
        ]
      }
    ]
  }
};

export default function WebhookTestPanel() {
  const [activeTab, setActiveTab] = useState('facebook');
  const [payloads, setPayloads] = useState({
    facebook: JSON.stringify(SAMPLE_PAYLOADS.facebook, null, 2),
    whatsapp: JSON.stringify(SAMPLE_PAYLOADS.whatsapp, null, 2)
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePayloadChange = (value) => {
    setPayloads(prev => ({ ...prev, [activeTab]: value }));
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const parsedPayload = JSON.parse(payloads[activeTab]);
      const endpoint = activeTab === 'facebook' 
        ? '/integrations/facebook/webhook' 
        : '/integrations/whatsapp/webhook';
        
      const response = await sendTestPayload(endpoint, parsedPayload);
      setResult(response);
    } catch (err) {
      setResult({
        success: false,
        status: 0,
        data: { error: 'Invalid JSON payload format. Please check your syntax.' },
        duration: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-lg font-semibold">Test Webhooks</CardTitle>
        <CardDescription>Send simulated payloads to your endpoints</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="facebook">Facebook Lead Ads</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                JSON Payload
              </label>
              <Textarea 
                value={payloads[activeTab]}
                onChange={(e) => handlePayloadChange(e.target.value)}
                className="font-mono text-xs h-[250px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                spellCheck={false}
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-200" : ""}>
                {result.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle className="flex items-center gap-2">
                  {result.success ? 'Success' : 'Failed'}
                  <span className="text-xs font-mono opacity-70 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                    HTTP {result.status}
                  </span>
                  <span className="text-xs flex items-center gap-1 opacity-70 ml-auto">
                    <Clock className="w-3 h-3" /> {result.duration}ms
                  </span>
                </AlertTitle>
                <AlertDescription className="mt-2 font-mono text-xs overflow-auto max-h-[100px]">
                  {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4">
        <Button 
          onClick={handleTest} 
          disabled={loading}
          className="w-full sm:w-auto ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Send Test Payload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
