import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const SLAPage = () => {
  const [policies, setPolicies] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Policies
      let policiesData = [];
      try {
        const response = await apiServerClient.fetch('/analytics/sla/policies');
        if (response.ok) policiesData = await response.json();
        else throw new Error('API fallback');
      } catch (err) {
        policiesData = await pb.collection('sla_policies').getFullList({
          sort: '-created',
          $autoCancel: false
        });
      }
      setPolicies(policiesData);

      // Fetch Breaches
      let breachesData = [];
      try {
        const response = await apiServerClient.fetch('/analytics/sla/breaches');
        if (response.ok) breachesData = await response.json();
        else throw new Error('API fallback');
      } catch (err) {
        breachesData = await pb.collection('conversation_metrics').getFullList({
          filter: 'sla_met = false',
          sort: '-created',
          limit: 10,
          expand: 'conversation_id,customer_id',
          $autoCancel: false
        });
      }
      setBreaches(breachesData);

    } catch (error) {
      console.error('Error fetching SLA data:', error);
      toast.error('Failed to load SLA data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning'; // Assuming warning exists, else default
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>SLA Management - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Level Agreements</h1>
            <p className="text-muted-foreground mt-1">Manage response and resolution time policies.</p>
          </div>
          <Button onClick={() => toast('SLA Editor coming soon')} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{policies.filter(p => p.is_active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Breaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{breaches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">94.2%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SLA Policies</CardTitle>
            <CardDescription>Active rules governing response times across channels.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>First Response</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading policies...</TableCell>
                  </TableRow>
                ) : policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No SLA policies configured.</TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell className="capitalize">{policy.channel}</TableCell>
                      <TableCell>
                        <Badge variant={policy.priority_level === 'critical' ? 'destructive' : 'secondary'} className="capitalize">
                          {policy.priority_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {policy.first_response_time} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                          {policy.resolution_time} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.is_active ? "default" : "outline"}>
                          {policy.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Recent SLA Breaches
            </CardTitle>
            <CardDescription>Conversations that failed to meet SLA targets.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conversation ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Missed Target</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading breaches...</TableCell>
                  </TableRow>
                ) : breaches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No recent SLA breaches. Great job!</TableCell>
                  </TableRow>
                ) : (
                  breaches.map((breach) => (
                    <TableRow key={breach.id}>
                      <TableCell className="font-mono text-xs">{breach.conversation_id}</TableCell>
                      <TableCell className="capitalize">{breach.channel}</TableCell>
                      <TableCell>{breach.expand?.customer_id?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <span className="text-destructive text-sm font-medium">
                          {!breach.first_response_sla_met ? 'First Response' : 'Resolution Time'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(breach.created_at || breach.created).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SLAPage;