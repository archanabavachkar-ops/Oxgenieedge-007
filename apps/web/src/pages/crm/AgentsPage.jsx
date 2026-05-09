import React, { useState, useEffect } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Users, PhoneCall, Clock, Star } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const records = await pb.collection('agents').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setAgents(records);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <CRMLayout
      title="Agents Directory"
      description="Manage your human agents and monitor their current status."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Agents' }
      ]}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-sm"><CardContent className="p-6"><Skeleton className="h-24 w-full mb-4"/><Skeleton className="h-10 w-full"/></CardContent></Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No agents found</h3>
          <p className="text-muted-foreground">Add agents to your team to start handling escalations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {agent.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{agent.department || 'General'}</p>
                    </div>
                  </div>
                  <Badge className={`capitalize ${getStatusColor(agent.status)}`} variant="secondary">
                    {agent.status || 'offline'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-muted-foreground mb-1">
                      <PhoneCall className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-semibold">124</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Calls</p>
                  </div>
                  <div className="text-center border-x">
                    <div className="flex items-center justify-center text-muted-foreground mb-1">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-semibold">4m</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Avg Time</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-warning mb-1">
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                    <p className="text-sm font-semibold">4.8</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CRMLayout>
  );
}