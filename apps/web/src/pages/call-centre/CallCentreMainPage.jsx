import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { PhoneCall, PhoneMissed, Users, Clock, MessageSquare, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const CallCentreMainPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual endpoints. Using mock data for the dashboard view based on the API structure.
        const callsRes = await apiServerClient.fetch('/call-centre/calls?limit=5');
        const convsRes = await apiServerClient.fetch('/call-centre/conversations?status=active&limit=5');
        
        const callsData = await callsRes.json();
        const convsData = await convsRes.json();

        setRecentCalls(callsData.calls || []);
        setActiveConversations(convsData.conversations || []);
        
        // Mock stats
        setStats({
          callsToday: 142,
          missedCalls: 12,
          activeAgents: 8,
          avgDuration: '4m 12s'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>OmniCenter Dashboard</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">Monitor your call centre performance and active channels.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/call-centre/credits">View Credits</Link>
            </Button>
            <Button asChild>
              <Link to="/call-centre/calls">All Calls</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Calls Today</CardTitle>
              <PhoneCall className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.callsToday}</div>
                  <p className="text-xs text-success mt-1">+14% from yesterday</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Missed Calls</CardTitle>
              <PhoneMissed className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.missedCalls}</div>
                  <p className="text-xs text-destructive mt-1">+2 since last hour</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.activeAgents}</div>
                  <p className="text-xs text-muted-foreground mt-1">Out of 12 total</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.avgDuration}</div>
                  <p className="text-xs text-success mt-1">-12s from average</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Calls */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>Latest inbound and outbound calls</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/call-centre/calls" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentCalls.length > 0 ? (
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${call.call_type === 'inbound' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          <PhoneCall className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{call.phone_number}</p>
                          <p className="text-xs text-muted-foreground capitalize">{call.call_type} • {call.duration}s</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                          {call.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/call-centre/calls/${call.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-muted-foreground">No recent calls found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Conversations */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Conversations</CardTitle>
                <CardDescription>Ongoing chats across all channels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/call-centre/conversations" className="flex items-center">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activeConversations.length > 0 ? (
                <div className="space-y-4">
                  {activeConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{conv.customer_id || 'Unknown Customer'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{conv.conversation_type} • {conv.unread_count || 0} unread</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/call-centre/conversations/${conv.id}`}>Reply</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-muted-foreground">No active conversations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CallCentreMainPage;