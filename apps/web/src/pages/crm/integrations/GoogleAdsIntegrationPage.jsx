import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Globe, ArrowLeft, Save, TestTube, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const GoogleAdsIntegrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState('disconnected');
  
  const [formData, setFormData] = useState({
    customerId: '',
    developerToken: '',
    clientId: '',
    clientSecret: '',
    refreshToken: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const records = await pb.collection('integrations').getFullList({
        filter: 'type="google_ads"',
        $autoCancel: false
      });
      
      if (records.length > 0) {
        const record = records[0];
        setRecordId(record.id);
        setStatus(record.status);
        if (record.credentials) {
          setFormData({
            customerId: record.credentials.customerId || '',
            developerToken: record.credentials.developerToken || '',
            clientId: record.credentials.clientId || '',
            clientSecret: record.credentials.clientSecret || '',
            refreshToken: record.credentials.refreshToken || ''
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
    if (!formData.customerId || !formData.developerToken || !formData.refreshToken) {
      toast.error('Customer ID, Developer Token, and Refresh Token are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: 'Google Ads',
        type: 'google_ads',
        status: status === 'disconnected' ? 'connected' : status,
        credentials: formData
      };

      if (recordId) {
        await pb.collection('integrations').update(recordId, payload, { $autoCancel: false });
        toast.success('Google Ads configuration updated.');
      } else {
        const rec = await pb.collection('integrations').create(payload, { $autoCancel: false });
        setRecordId(rec.id);
        setStatus('connected');
        toast.success('Google Ads configuration saved.');
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
        toast.success('Connection successful! Google Ads API is reachable.');
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

  const handleManualSync = async () => {
    if (!recordId) return;
    setSyncing(true);
    try {
      const res = await apiServerClient.fetch(`/crm/integrations/google-ads/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: recordId })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Sync complete. Imported ${data.leadsImported || 0} leads.`);
      } else {
        throw new Error('Sync failed via API Server.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Sync failed. Check credentials and try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <CrmLayout title="Google Ads Integration"><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></CrmLayout>;
  }

  return (
    <CrmLayout title="Google Ads Integration">
      <Helmet><title>Google Ads Setup - CRM</title></Helmet>

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
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Google Ads API Credentials</CardTitle>
                    <CardDescription>Connect to import lead form assets and attribute conversions.</CardDescription>
                  </div>
                </div>
                {status === 'connected' && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="customerId">Manager / Account Customer ID <span className="text-destructive">*</span></Label>
                <Input 
                  id="customerId" 
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  placeholder="123-456-7890"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="developerToken">Developer Token <span className="text-destructive">*</span></Label>
                <Input 
                  id="developerToken" 
                  type="password"
                  value={formData.developerToken}
                  onChange={(e) => setFormData({...formData, developerToken: e.target.value})}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">OAuth Client ID</Label>
                  <Input 
                    id="clientId" 
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientSecret">OAuth Client Secret</Label>
                  <Input 
                    id="clientSecret" 
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refreshToken">Refresh Token <span className="text-destructive">*</span></Label>
                <Input 
                  id="refreshToken" 
                  type="password"
                  value={formData.refreshToken}
                  onChange={(e) => setFormData({...formData, refreshToken: e.target.value})}
                  className="bg-background text-foreground"
                />
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Config
                </Button>
                <Button onClick={handleTest} disabled={testing || !recordId} variant="outline" className="min-w-[120px]">
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />} Test Connection
                </Button>
                {status === 'connected' && (
                  <Button onClick={handleManualSync} disabled={syncing} variant="secondary" className="ml-auto">
                    {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Trigger Manual Sync
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Authentication Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Google Ads API uses OAuth2 for authentication:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Create a project in Google Cloud Console.</li>
                <li>Enable the Google Ads API.</li>
                <li>Create Desktop App OAuth 2.0 Credentials (Client ID & Secret).</li>
                <li>Use Google's OAuth2 Playground or a script to generate a Refresh Token.</li>
                <li>Obtain your Developer Token from the Google Ads Manager account API Center.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default GoogleAdsIntegrationPage;