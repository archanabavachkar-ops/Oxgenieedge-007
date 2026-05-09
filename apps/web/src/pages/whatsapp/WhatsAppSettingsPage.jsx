import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { useWhatsAppData } from '@/hooks/useWhatsAppData.js';
import { useAutoLeadCreation } from '@/hooks/useAutoLeadCreation.js';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, RefreshCw, Zap } from 'lucide-react';

export default function WhatsAppSettingsPage() {
  const { settings, loadingSettings, fetchWhatsAppSettings } = useWhatsAppData();
  const { isAutoCreateEnabled, toggleAutoCreate } = useAutoLeadCreation();
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const webhookUrl = "https://oxgenieedge.com/api/whatsapp/webhook";
  const verifyToken = "whatsapp_verify_token_secure_2024_xyz789";

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      await apiServerClient.fetch('/whatsapp/webhook');
      toast.success('Webhook test successful');
    } catch (error) {
      toast.error('Webhook test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!settings?.id) return;
    setDisconnecting(true);
    try {
      await pb.collection('whatsapp_settings').update(settings.id, {
        whatsappPhoneNumberId: '',
        whatsappBusinessAccountId: '',
        whatsappAccessToken: '',
        isConnected: false
      }, { $autoCancel: false });
      toast.success('WhatsApp disconnected successfully');
      fetchWhatsAppSettings();
    } catch (error) {
      toast.error('Failed to disconnect: ' + error.message);
    } finally {
      setDisconnecting(false);
    }
  };

  if (loadingSettings) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="h-64 bg-muted rounded w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your Meta WhatsApp API connection and automation preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Status
              {settings?.isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
            </CardTitle>
            <CardDescription>Current status of your WhatsApp integration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input value={webhookUrl} readOnly className="bg-muted text-muted-foreground font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Verify Token</Label>
              <Input value={verifyToken} readOnly className="bg-muted text-muted-foreground font-mono text-sm" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-6 mt-2">
            <Button variant="outline" onClick={handleTestWebhook} disabled={testing}>
              {testing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Test Webhook
            </Button>
            {settings?.isConnected && (
              <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
                Disconnect
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5 text-yellow-500" />
                Automation Settings
              </CardTitle>
              <CardDescription>Configure how incoming messages are handled.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-1">
                  <h4 className="font-medium">Auto-Create Leads</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically create or update a lead when a new WhatsApp message is received.
                  </p>
                </div>
                <Switch 
                  checked={isAutoCreateEnabled}
                  onCheckedChange={toggleAutoCreate}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Meta App Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input 
                  value={settings?.whatsappPhoneNumberId || 'Not configured'} 
                  readOnly 
                  className="bg-muted text-muted-foreground" 
                />
              </div>
              <div className="space-y-2">
                <Label>Business Account ID</Label>
                <Input 
                  value={settings?.whatsappBusinessAccountId || 'Not configured'} 
                  readOnly 
                  className="bg-muted text-muted-foreground" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}