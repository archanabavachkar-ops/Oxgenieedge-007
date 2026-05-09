import React, { useState, useEffect } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { PhoneCall, PhoneIncoming, PhoneMissed, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const records = await pb.collection('calls').getList(1, 50, {
          sort: '-created',
          $autoCancel: false
        });
        setCalls(records.items);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalls();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>;
      case 'missed': return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Missed</Badge>;
      case 'failed': return <Badge variant="outline" className="text-muted-foreground">Failed</Badge>;
      default: return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 capitalize">{status}</Badge>;
    }
  };

  const stats = [
    { title: 'Total Calls', value: calls.length, icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Completed', value: calls.filter(c => c.status === 'completed').length, icon: PhoneIncoming, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Missed', value: calls.filter(c => c.status === 'missed').length, icon: PhoneMissed, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <CRMLayout
      title="Call Logs"
      description="Review all inbound and outbound call activity."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Calls' }
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

        {/* Calls Table */}
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : calls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <PhoneCall className="h-10 w-10 opacity-20 mb-3" />
                      <p className="text-lg font-medium text-foreground">No calls recorded</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                calls.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {call.phone_number}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm text-muted-foreground">{call.call_type || 'inbound'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(call.duration)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(call.created).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
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