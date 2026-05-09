import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, MessageSquare, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const ConversationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        let url = '/call-centre/conversations?limit=20';
        if (statusFilter !== 'all') url += `&status=${statusFilter}`;
        if (channelFilter !== 'all') url += `&channel=${channelFilter}`;
        
        const response = await apiServerClient.fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setConversations(data.conversations || []);
        } else {
          throw new Error(data.error || 'Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Could not load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [statusFilter, channelFilter]);

  const filteredConversations = conversations.filter(conv => 
    conv.customer_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'whatsapp': return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'sms': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'email': return <Mail className="h-5 w-5 text-orange-500" />;
      case 'voice': return <Phone className="h-5 w-5 text-purple-500" />;
      default: return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Conversations - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
            <p className="text-muted-foreground">Manage omnichannel customer interactions.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search customer name or ID..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="chat">Web Chat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))
          ) : filteredConversations.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No conversations found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </Card>
          ) : (
            filteredConversations.map((conv) => (
              <Card 
                key={conv.id} 
                className="p-4 cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => navigate(`/call-centre/conversations/${conv.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getChannelIcon(conv.conversation_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate pr-4">{conv.customer_id || 'Unknown Customer'}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'New'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate pr-4">
                        Click to view conversation history...
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {conv.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground">{conv.unread_count}</Badge>
                        )}
                        <Badge variant="outline" className="capitalize">{conv.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {!loading && filteredConversations.length > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredConversations.length}</strong> conversations
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
              <Button variant="outline" size="sm" disabled>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConversationsPage;