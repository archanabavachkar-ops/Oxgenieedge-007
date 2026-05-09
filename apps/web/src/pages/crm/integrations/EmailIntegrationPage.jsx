import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Mail, ArrowLeft, Save, TestTube, Loader2, CheckCircle2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const EmailIntegrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState('disconnected');
  
  const [formData, setFormData] = useState({
    provider: 'smtp',
    emailAddress: '',
    password: '',
    smtpHost: '',
    smtpPort: '587'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const records = await pb.collection('integrations').getFullList({
        filter: 'type="email"',
        $autoCancel: false
      });
      
      if (records.length > 0) {
        const record = records[0];
        setRecordId(record.id);
        setStatus(record.status);
        if (record.credentials) {
          setFormData({
            provider: record.credentials.provider || 'smtp',
            emailAddress: record.credentials.emailAddress || '',
            password: record.credentials.password || '',
            smtpHost: record.credentials.smtpHost || '',
            smtpPort: record.credentials.smtpPort || '587'
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (val) => {
    setFormData(prev => ({
      ...prev, 
      provider: val,
      smtpHost: val === 'gmail' ? 'smtp.gmail.com' : prev.smtpHost,
      smtpPort: val === 'gmail' ? '587' : prev.smtpPort
    }));
  };

  const handleSave = async () => {
    if (!formData.emailAddress || !formData.password || !formData.smtpHost) {
      toast.error('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: 'Email SMTP Server',
        type: 'email',
        status: status === 'disconnected' ? 'connected' : status,
        credentials: {
          provider: formData.provider,
          emailAddress: formData.emailAddress,
          password: formData.password,
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort
        }
      };

      if (recordId) {
        await pb.collection('integrations').update(recordId, payload, { $autoCancel: false });
        toast.success('Email configuration updated.');
      } else {
        const rec = await pb.collection('integrations').create(payload, { $autoCancel: false });
        setRecordId(rec.id);
        setStatus('connected');
        toast.success('Email configuration saved.');
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
        toast.success('SMTP Connection successful!');
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

  if (loading) {
    return <CrmLayout title="Email Integration"><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></CrmLayout>;
  }

  return (
    <CrmLayout title="Email & SMTP Integration">
      <Helmet><title>Email Setup - CRM Integrations</title></Helmet>

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
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">SMTP Configuration</CardTitle>
                    <CardDescription>Connect your mail server to send automated emails directly from the CRM.</CardDescription>
                  </div>
                </div>
                {status === 'connected' && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid gap-2">
                <Label>Service Provider</Label>
                <Select value={formData.provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">Custom SMTP Server</SelectItem>
                    <SelectItem value="gmail">Google Workspace / Gmail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="emailAddress">Email Address <span className="text-destructive">*</span></Label>
                  <Input 
                    id="emailAddress" 
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({...formData, emailAddress: e.target.value})}
                    placeholder="sales@yourcompany.com"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password / App Password <span className="text-destructive">*</span></Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="bg-background text-foreground"
                  />
                  {formData.provider === 'gmail' && (
                    <p className="text-xs text-muted-foreground mt-1">Use a Google App Password, NOT your main password.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="smtpHost">SMTP Host <span className="text-destructive">*</span></Label>
                  <Input 
                    id="smtpHost" 
                    value={formData.smtpHost}
                    onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                    placeholder="smtp.example.com"
                    disabled={formData.provider === 'gmail'}
                    className="bg-background text-foreground disabled:opacity-70"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtpPort">Port <span className="text-destructive">*</span></Label>
                  <Input 
                    id="smtpPort" 
                    value={formData.smtpPort}
                    onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                    placeholder="587"
                    disabled={formData.provider === 'gmail'}
                    className="bg-background text-foreground disabled:opacity-70"
                  />
                </div>
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
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Gmail Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>If you are using Gmail or Google Workspace:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Ensure <strong>2-Step Verification</strong> is enabled on your Google Account.</li>
                <li>Go to Google Account Manage &gt; Security &gt; App Passwords.</li>
                <li>Create a new App Password named "CRM Integration".</li>
                <li>Copy the 16-character password and paste it into the Password field here.</li>
                <li>The Host and Port will be configured automatically.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default EmailIntegrationPage;