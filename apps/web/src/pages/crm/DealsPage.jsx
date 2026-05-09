
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Briefcase, Plus, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const records = await pb.collection('deals').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setDeals(records);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <CrmLayout 
      title="Deals Pipeline" 
      description="Manage your sales pipeline and track deal progress."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Deals' }
      ]}
    >
      <Helmet><title>Deals - CRM</title></Helmet>

      <div className="flex justify-end mb-6">
        <Button className="hover-lift">
          <Plus className="w-4 h-4 mr-2" /> Add Deal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : deals.length === 0 ? (
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No deals found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Your pipeline is currently empty. Create a new deal to start tracking your sales opportunities.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create First Deal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder for Kanban Board */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              Open <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">0</span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
              {/* Deal cards would go here */}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              Negotiation <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">0</span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              Closed Won <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs">0</span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
            </div>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
