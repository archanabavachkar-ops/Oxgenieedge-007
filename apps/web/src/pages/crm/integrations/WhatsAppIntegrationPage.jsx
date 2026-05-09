import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MessageCircle, ArrowLeft, Save, TestTube, Loader2, CheckCircle2, Copy } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const WhatsAppIntegrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState('disconnected');
  
  const webhookUrl = `${window.location.origin}/hcgi/api/crm/integrations/whatsapp/webhook`;
  
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    webhookVerifyToken: crypto.randomUUID().split('-')[0] + crypto.randomUUID().split('-')[1] // Generate random token
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const records = await pb.collection('integrations').getFullList({
        filter: 'type="whatsapp"',
        $autoCancel: false
      });
      
      if (records.length > 0) {
        const record = records[0];
        setRecordId(record.id);
        setStatus(record.status);
        if (record.credentials) {
          setFormData({
            phoneNumberId: record.credentials.phoneNumberId || '',
            businessAccountId: record.credentials.businessAccountId || '',
            accessToken: record.credentials.accessToken || '',
            webhookVerifyToken: record.webhook_token || formData.webhookVerifyToken
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.phoneNumberId || !formData.accessToken) {
      toast.error('Phone Number ID and Access Token are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: 'WhatsApp Cloud API',
        type: 'whatsapp',
        status: status === 'disconnected' ? 'connected' : status,
        webhook_url: webhookUrl,
        webhook_token: formData.webhookVerifyToken,
        credentials: {
          phoneNumberId: formData.phoneNumberId,
          businessAccountId: formData.businessAccountId,
          accessToken: formData.accessToken
        }
      };

      if (recordId) {
        await pb.collection('integrations').update(recordId, payload, { $autoCancel: false });
        toast.success('WhatsApp integration updated.');
      } else {
        const rec = await pb.collection('integrations').create(payload, { $autoCancel: false });
        setRecordId(rec.id);
        setStatus('connected');
        toast.success('WhatsApp integration saved.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save integration configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!recordId) {
      toast.error('Please save your configuration first.');
      return;
    }

    setTesting(true);
    try {
      const res = await apiServerClient.fetch(`/crm/integrations/${recordId}/test`, { method: 'POST' });
      if (res.ok) {
        toast.success('Connection successful! Credentials are valid.');
        await pb.collection('integrations').update(recordId, { status: 'connected' }, { $autoCancel: false });
        setStatus('connected');
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Connection failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(`Test failed: ${err.message}`);
      await pb.collection('integrations').update(recordId, { status: 'error' }, { $autoCancel: false });
      setStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <CrmLayout title="WhatsApp Integration">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title="WhatsApp Business Integration">
      <Helmet><title>WhatsApp Setup - CRM Integrations</title></Helmet>

      <div className="mb-6">
        <Link to="/admin/crm/integrations" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Integrations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20 pb-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">API Credentials</CardTitle>
                    <CardDescription>Connect to Meta's official WhatsApp Cloud API</CardDescription>
                  </div>
                </div>
                {status === 'connected' && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="phoneNumberId">Phone Number ID <span className="text-destructive">*</span></Label>
                <Input 
                  id="phoneNumberId" 
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({...formData, phoneNumberId: e.target.value})}
                  placeholder="e.g. 101428059xxxxxx"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessAccountId">WhatsApp Business Account ID</Label>
                <Input 
                  id="businessAccountId" 
                  value={formData.businessAccountId}
                  onChange={(e) => setFormData({...formData, businessAccountId: e.target.value})}
                  placeholder="e.g. 102554749xxxxxx"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessToken">Permanent Access Token <span className="text-destructive">*</span></Label>
                <Input 
                  id="accessToken" 
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
                  placeholder="EAAI..."
                  className="bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Generate a permanent token from your Meta App Dashboard &gt; System Users.</p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Config
                </Button>
                <Button onClick={handleTest} disabled={testing || !recordId} variant="outline" className="min-w-[120px]">
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />} Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="text-lg">Webhook Setup</CardTitle>
              <CardDescription>Configure this in Meta Dashboard to receive messages</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Callback URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="bg-muted text-muted-foreground" />
                  <Button variant="secondary" onClick={() => copyToClipboard(webhookUrl)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Verify Token</Label>
                <div className="flex gap-2">
                  <Input readOnly value={formData.webhookVerifyToken} className="bg-muted text-muted-foreground" />
                  <Button variant="secondary" onClick={() => copyToClipboard(formData.webhookVerifyToken)}><Copy className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">This token is used by Meta to verify webhook ownership.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <ol className="list-decimal pl-4 space-y-3">
                <li>Create a Meta Developer account and create an app (Business type).</li>
                <li>Add the WhatsApp product to your app.</li>
                <li>Copy the Phone Number ID from the "API Setup" panel.</li>
                <li>Create a System User with Admin access and generate a permanent access token.</li>
                <li>Paste the IDs and Token here and click Save.</li>
                <li>Copy the Webhook Callback URL and Verify Token.</li>
                <li>In Meta Dashboard &gt; WhatsApp &gt; Configuration, setup webhooks using these values.</li>
                <li>Subscribe to the <code className="bg-muted px-1 py-0.5 rounded text-xs text-foreground">messages</code> event.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default WhatsAppIntegrationPage;