import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowLeft } from 'lucide-react';
import LogsViewer from '@/components/crm/integrations/LogsViewer.jsx';
import IntegrationHelpDocumentation from '@/components/crm/integrations/IntegrationHelpDocumentation.jsx';

// Import all specific setup wizards and panels dynamically or switch case
import WhatsAppSetupWizard from '@/components/crm/integrations/wizards/WhatsAppSetupWizard.jsx';
import WhatsAppConfigurationPanel from '@/components/crm/integrations/panels/WhatsAppConfigurationPanel.jsx';
import GoogleAdsSetupWizard from '@/components/crm/integrations/wizards/GoogleAdsSetupWizard.jsx';
import GoogleAdsConfigurationPanel from '@/components/crm/integrations/panels/GoogleAdsConfigurationPanel.jsx';
import FacebookLeadAdsSetupWizard from '@/components/crm/integrations/wizards/FacebookLeadAdsSetupWizard.jsx';
import FacebookLeadAdsConfigurationPanel from '@/components/crm/integrations/panels/FacebookLeadAdsConfigurationPanel.jsx';
import EmailSetupWizard from '@/components/crm/integrations/wizards/EmailSetupWizard.jsx';
import EmailConfigurationPanel from '@/components/crm/integrations/panels/EmailConfigurationPanel.jsx';
import WebhookSetupWizard from '@/components/crm/integrations/wizards/WebhookSetupWizard.jsx';
import WebhookConfigurationPanel from '@/components/crm/integrations/panels/WebhookConfigurationPanel.jsx';
import StripeSetupWizard from '@/components/crm/integrations/wizards/StripeSetupWizard.jsx';
import StripeConfigurationPanel from '@/components/crm/integrations/panels/StripeConfigurationPanel.jsx';
import RazorpaySetupWizard from '@/components/crm/integrations/wizards/RazorpaySetupWizard.jsx';
import RazorpayConfigurationPanel from '@/components/crm/integrations/panels/RazorpayConfigurationPanel.jsx';
import AnalyticsDashboardSetupWizard from '@/components/crm/integrations/wizards/AnalyticsDashboardSetupWizard.jsx';
import AnalyticsDashboardConfigurationPanel from '@/components/crm/integrations/panels/AnalyticsDashboardConfigurationPanel.jsx';
import OnlineStoreSetupWizard from '@/components/crm/integrations/wizards/OnlineStoreSetupWizard.jsx';
import OnlineStoreConfigurationPanel from '@/components/crm/integrations/panels/OnlineStoreConfigurationPanel.jsx';
import OAuth2SocialLoginSetupWizard from '@/components/crm/integrations/wizards/OAuth2SocialLoginSetupWizard.jsx';
import OAuth2SocialLoginConfigurationPanel from '@/components/crm/integrations/panels/OAuth2SocialLoginConfigurationPanel.jsx';

import { integrationConfigs } from '@/config/integrationConfigs.js';

const IntegrationDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'setup';
  
  const [integration, setIntegration] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    const configData = integrationConfigs[slug];
    if (configData) {
      setIntegration({ ...configData, status: 'needs_setup', health_score: 0 });
    }
  }, [slug]);

  const handleTabChange = (value) => setSearchParams({ tab: value });

  const renderWizard = () => {
    const props = { isOpen: isWizardOpen, onClose: () => setIsWizardOpen(false), onComplete: () => { setIsWizardOpen(false); setIntegration(prev => ({...prev, status: 'connected'})); } };
    switch(slug) {
      case 'whatsapp': return <WhatsAppSetupWizard {...props} />;
      case 'google-ads': return <GoogleAdsSetupWizard {...props} />;
      case 'facebook-leads': return <FacebookLeadAdsSetupWizard {...props} />;
      case 'email': return <EmailSetupWizard {...props} />;
      case 'webhook': return <WebhookSetupWizard {...props} />;
      case 'stripe': return <StripeSetupWizard {...props} />;
      case 'razorpay': return <RazorpaySetupWizard {...props} />;
      case 'analytics-dashboard': return <AnalyticsDashboardSetupWizard {...props} />;
      case 'online-store': return <OnlineStoreSetupWizard {...props} />;
      case 'oauth2-social': return <OAuth2SocialLoginSetupWizard {...props} />;
      default: return null;
    }
  };

  const renderPanel = () => {
    switch(slug) {
      case 'whatsapp': return <WhatsAppConfigurationPanel />;
      case 'google-ads': return <GoogleAdsConfigurationPanel />;
      case 'facebook-leads': return <FacebookLeadAdsConfigurationPanel />;
      case 'email': return <EmailConfigurationPanel />;
      case 'webhook': return <WebhookConfigurationPanel />;
      case 'stripe': return <StripeConfigurationPanel />;
      case 'razorpay': return <RazorpayConfigurationPanel />;
      case 'analytics-dashboard': return <AnalyticsDashboardConfigurationPanel />;
      case 'online-store': return <OnlineStoreConfigurationPanel />;
      case 'oauth2-social': return <OAuth2SocialLoginConfigurationPanel />;
      default: return <div className="text-muted-foreground p-8 text-center border rounded-xl border-dashed">Configuration panel not found</div>;
    }
  };

  if (!integration) return <CrmLayout><div className="animate-pulse h-64 bg-muted rounded-xl" /></CrmLayout>;

  return (
    <CrmLayout>
      <Helmet><title>{integration.name} - CRM</title></Helmet>

      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/crm/integrations')} className="mb-4 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Integrations
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{integration.name}</h1>
          <Badge variant="outline" className={integration.status === 'connected' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
            {integration.status === 'connected' ? 'Connected' : 'Needs Setup'}
          </Badge>
        </div>
        <p className="text-muted-foreground">{integration.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="setup" className="px-6">Setup</TabsTrigger>
          <TabsTrigger value="config" className="px-6" disabled={integration.status !== 'connected'}>Configuration</TabsTrigger>
          <TabsTrigger value="logs" className="px-6">Logs</TabsTrigger>
          <TabsTrigger value="help" className="px-6">Help & Docs</TabsTrigger>
        </TabsList>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
          <TabsContent value="setup" className="m-0">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-semibold">Connection Status</h2>
              {integration.status === 'connected' ? (
                 <div className="p-6 rounded-xl border bg-success/5 text-success border-success/20">Active and Connected. Review Configuration tab to map data.</div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed text-center space-y-4">
                  <p className="text-muted-foreground">This integration requires authorization before it can sync data.</p>
                  <Button onClick={() => setIsWizardOpen(true)}>Start Setup Wizard</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="m-0 max-w-3xl">
            <h2 className="text-2xl font-semibold mb-6">Integration Settings</h2>
            {renderPanel()}
          </TabsContent>

          <TabsContent value="logs" className="m-0">
            <div className="space-y-6"><h2 className="text-2xl font-semibold">Activity Logs</h2><LogsViewer integrationId={slug} /></div>
          </TabsContent>

          <TabsContent value="help" className="m-0">
            <IntegrationHelpDocumentation slug={slug} />
          </TabsContent>
        </div>
      </Tabs>
      {renderWizard()}
    </CrmLayout>
  );
};

export default IntegrationDetailPage;