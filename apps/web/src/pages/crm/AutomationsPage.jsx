import React, { useState, useEffect } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Workflow, Zap, PlayCircle, CheckCircle2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function AutomationsPage() {
  const [triggers, setTriggers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTriggers = async () => {
      try {
        const records = await pb.collection('automation_triggers').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setTriggers(records);
      } catch (error) {
        console.error('Error fetching automation triggers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTriggers();
  }, []);

  const stats = [
    { title: 'Total Triggers', value: triggers.length, icon: Workflow, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Completed', value: triggers.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Pending', value: triggers.filter(t => t.status === 'pending').length, icon: PlayCircle, color: 'text-warning-foreground', bg: 'bg-warning/10' },
  ];

  return (
    <CRMLayout
      title="Automations"
      description="Monitor and manage your active automation triggers and workflows."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Automations' }
      ]}
    >
      <div className="space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="shadow-sm border-border/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Triggers List */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-founder-primary" />
              Recent Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : triggers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No automation triggers found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-foreground">{trigger.intent || 'Unknown Intent'}</h4>
                        <Badge variant="outline" className="capitalize">{trigger.workflow_type || 'Standard'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Triggered on {new Date(trigger.created).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={trigger.status === 'completed' ? 'default' : trigger.status === 'failed' ? 'destructive' : 'secondary'}
                        className={trigger.status === 'completed' ? 'bg-success hover:bg-success/90' : ''}
                      >
                        {trigger.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </CRMLayout>
  );
}