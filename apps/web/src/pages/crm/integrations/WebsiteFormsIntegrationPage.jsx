import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { LayoutTemplate, ArrowLeft, Save, Copy, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const WebsiteFormsIntegrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  
  const webhookUrl = `${window.location.origin}/hcgi/api/crm/integrations/website-forms/webhook`;
  
  const [formData, setFormData] = useState({
    webhookSecret: crypto.randomUUID().split('-')[0] + crypto.randomUUID().split('-')[1]
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const records = await pb.collection('integrations').getFullList({
        filter: 'type="website_forms"',
        $autoCancel: false
      });
      
      if (records.length > 0) {
        const record = records[0];
        setRecordId(record.id);
        if (record.webhook_token) {
          setFormData({ webhookSecret: record.webhook_token });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: 'Website Webhooks',
        type: 'website_forms',
        status: 'connected',
        webhook_url: webhookUrl,
        webhook_token: formData.webhookSecret
      };

      if (recordId) {
        await pb.collection('integrations').update(recordId, payload, { $autoCancel: false });
        toast.success('Webhook configuration updated.');
      } else {
        const rec = await pb.collection('integrations').create(payload, { $autoCancel: false });
        setRecordId(rec.id);
        toast.success('Webhook configuration created.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save webhook configuration.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const codeSnippet = `// Example Node.js Payload
fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': '${formData.webhookSecret}'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '+1234567890',
    source: 'Website Contact Form'
  })
});`;

  if (loading) {
    return <CrmLayout title="Website Forms"><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></CrmLayout>;
  }

  return (
    <CrmLayout title="Website Forms & Custom Webhooks">
      <Helmet><title>Webhooks Setup - CRM Integrations</title></Helmet>

      <div className="mb-6">
        <Link to="/admin/crm/integrations" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Integrations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Webhook Setup</CardTitle>
                  <CardDescription>Send POST requests to this URL to automatically create leads in the CRM.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Your Webhook Endpoint URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="bg-muted text-muted-foreground font-mono text-sm" />
                  <Button variant="secondary" onClick={() => copyToClipboard(webhookUrl)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Security Secret (X-Webhook-Secret Header)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.webhookSecret} 
                    onChange={(e) => setFormData({webhookSecret: e.target.value})} 
                    className="font-mono text-sm bg-background text-foreground"
                  />
                  <Button variant="secondary" onClick={() => copyToClipboard(formData.webhookSecret)}><Copy className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">Passed in headers to verify the request originates from your systems.</p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="text-lg">Code Example</CardTitle>
              <CardDescription>How to send leads to the CRM</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-slate-950 p-4 overflow-x-auto">
                <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Payload Schema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>The webhook expects a JSON body with the following fields to create a Lead properly:</p>
              <ul className="space-y-2">
                <li><code className="bg-muted px-1 rounded text-foreground font-semibold">name</code> (string, required)</li>
                <li><code className="bg-muted px-1 rounded text-foreground font-semibold">email</code> (string, required)</li>
                <li><code className="bg-muted px-1 rounded text-foreground font-semibold">mobile</code> (string, required)</li>
                <li><code className="bg-muted px-1 rounded text-foreground">source</code> (string, optional)</li>
                <li><code className="bg-muted px-1 rounded text-foreground">description</code> (string, optional)</li>
              </ul>
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 rounded-lg border border-rose-100 dark:border-rose-900/50">
                Ensure your server includes the <strong>X-Webhook-Secret</strong> header matching the token defined above.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default WebsiteFormsIntegrationPage;