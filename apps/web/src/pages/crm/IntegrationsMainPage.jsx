import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import IntegrationCard from '@/components/crm/integrations/IntegrationCard.jsx';
import FacebookConnectionModal from '@/components/crm/integrations/FacebookConnectionModal.jsx';
import FacebookManagementModal from '@/components/crm/integrations/FacebookManagementModal.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Search, Filter } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

// Full catalog based on prompt requirements
const INTEGRATIONS_CATALOG = [
  { 
    id: 'facebook', 
    name: 'Facebook Lead Ads', 
    icon: 'Facebook', 
    category: 'Marketing', 
    description: 'Automatically capture leads from your Facebook Lead Ads campaigns and sync them directly to your CRM.' 
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp Business', 
    icon: 'WhatsApp', 
    category: 'Communication', 
    description: 'Connect your WhatsApp Business account for automated customer messaging and support.' 
  },
  { 
    id: 'email', 
    name: 'Email (SMTP/Gmail)', 
    icon: 'Email', 
    category: 'Communication', 
    description: 'Send and receive emails directly from your CRM using secure SMTP or Gmail integration.' 
  },
  { 
    id: 'calls', 
    name: 'Incoming Calls', 
    icon: 'Calls', 
    category: 'Communication', 
    description: 'Route and log incoming customer calls automatically with cloud telephony providers.' 
  },
  { 
    id: 'stripe', 
    name: 'Stripe Payments', 
    icon: 'Stripe', 
    category: 'Payments', 
    description: 'Securely process payments, manage subscriptions, and send automated invoices.' 
  },
  { 
    id: 'google-ads', 
    name: 'Google Ads', 
    icon: 'GoogleAds', 
    category: 'Marketing', 
    description: 'Sync conversion data and track your Google Ads campaign performance directly.' 
  }
];

const IntegrationsMainPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Modal states
  const [isFbConnectOpen, setIsFbConnectOpen] = useState(false);
  const [isFbManageOpen, setIsFbManageOpen] = useState(false);
  const [fbIntegrationData, setFbIntegrationData] = useState(null);

  const fetchIntegrationStatuses = async () => {
    setIsLoading(true);
    try {
      // Fetch Facebook integration specifically as requested
      let fbData = null;
      try {
        const records = await pb.collection('facebook_integrations').getFullList({ $autoCancel: false });
        if (records && records.length > 0) {
          fbData = records[0];
          setFbIntegrationData(fbData);
        } else {
          setFbIntegrationData(null);
        }
      } catch (err) {
        console.warn('Could not fetch facebook_integrations collection, schema might be empty:', err);
      }

      // Map catalog to state
      const mapped = INTEGRATIONS_CATALOG.map(item => {
        if (item.id === 'facebook') {
          return {
            ...item,
            status: fbData ? 'Connected' : 'Disconnected',
          };
        }
        return {
          ...item,
          status: 'Coming Soon' // Hardcoded based on prompt
        };
      });

      setIntegrations(mapped);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatuses();
  }, []);

  const handleActionClick = (integration) => {
    if (integration.id === 'facebook') {
      if (integration.status === 'Connected') {
        setIsFbManageOpen(true);
      } else {
        setIsFbConnectOpen(true);
      }
    } else if (integration.status === 'Coming Soon') {
      toast.info('This integration is currently under development.');
    }
  };

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || int.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <CrmLayout>
      <Helmet>
        <title>Integrations - CRM</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-spacing">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="page-title mb-2">Integrations</h1>
          <p className="text-muted-foreground text-lg max-w-3xl text-balance">
            Connect your favorite tools to automate lead capture and workflows, creating a unified system for your team.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search integrations..." 
              className="pl-9 bg-card text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-card">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Communication">Communication</SelectItem>
              <SelectItem value="Payments">Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[240px] rounded-2xl bg-muted animate-pulse border border-border/50"></div>
            ))}
          </div>
        ) : filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard 
                key={integration.id} 
                integrationName={integration.name}
                description={integration.description}
                iconName={integration.icon}
                category={integration.category}
                status={integration.status}
                onConnect={() => handleActionClick(integration)}
                onManage={() => handleActionClick(integration)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <FacebookConnectionModal 
        isOpen={isFbConnectOpen} 
        onClose={() => setIsFbConnectOpen(false)}
        onConnected={fetchIntegrationStatuses}
      />

      <FacebookManagementModal
        isOpen={isFbManageOpen}
        onClose={() => setIsFbManageOpen(false)}
        integrationData={fbIntegrationData}
        onDisconnected={fetchIntegrationStatuses}
      />
    </CrmLayout>
  );
};

export default IntegrationsMainPage;