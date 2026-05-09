import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, Filter, Phone, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const CallsListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchCalls = async () => {
      setLoading(true);
      try {
        let url = '/call-centre/calls?limit=20';
        if (statusFilter !== 'all') url += `&status=${statusFilter}`;
        if (typeFilter !== 'all') url += `&type=${typeFilter}`;
        
        const response = await apiServerClient.fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setCalls(data.calls || []);
        } else {
          throw new Error(data.error || 'Failed to fetch calls');
        }
      } catch (error) {
        console.error('Error fetching calls:', error);
        toast.error('Could not load calls list');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [statusFilter, typeFilter]);

  const filteredCalls = calls.filter(call => 
    call.phone_number?.includes(search) || call.customer_id?.includes(search)
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20">Completed</Badge>;
      case 'missed': return <Badge variant="destructive">Missed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'connected': return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Connected</Badge>;
      default: return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Calls List - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call History</h1>
            <p className="text-muted-foreground">View and manage all inbound and outbound calls.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search phone number..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Call Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Date Range
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No calls found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalls.map((call) => (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/call-centre/calls/${call.id}`)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {call.phone_number}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{call.call_type}</TableCell>
                      <TableCell>{getStatusBadge(call.status)}</TableCell>
                      <TableCell>{call.duration ? `${call.duration}s` : '-'}</TableCell>
                      <TableCell>{call.agent_id || 'Unassigned'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(call.created_at || call.created).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/call-centre/calls/${call.id}`); }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <strong>1</strong> to <strong>{filteredCalls.length}</strong> of <strong>{filteredCalls.length}</strong> results
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
              <Button variant="outline" size="sm" disabled>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CallsListPage;