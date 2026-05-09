import React, { useState, useEffect } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils.js';

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchEscalations = async () => {
      setIsLoading(true);
      try {
        let filterStr = '';
        if (filter !== 'all') {
          filterStr = `status = "${filter}"`;
        }
        const records = await pb.collection('escalations').getFullList({
          filter: filterStr,
          sort: '-created',
          expand: 'agent_id,conversation_id',
          $autoCancel: false
        });
        setEscalations(records);
      } catch (error) {
        console.error('Error fetching escalations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEscalations();
  }, [filter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Active</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-warning/10 text-warning-foreground hover:bg-warning/20 border-warning/20">Pending</Badge>;
      case 'resolved': return <Badge variant="outline" className="bg-success/10 text-success hover:bg-success/20 border-success/20">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <CRMLayout
      title="Escalations"
      description="Manage and resolve conversations escalated from the AI Bot."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Escalations' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'resolved'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : escalations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 text-success/50 mb-3" />
                      <p className="text-lg font-medium text-foreground">No escalations found</p>
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                escalations.map((esc) => (
                  <TableRow key={esc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {esc.severity > 3 ? <AlertCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        {esc.escalation_reason || 'Unknown Reason'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        esc.severity > 3 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        Level {esc.severity || 1}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(esc.status)}</TableCell>
                    <TableCell>{esc.expand?.agent_id?.name || 'Unassigned'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(esc.created).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}