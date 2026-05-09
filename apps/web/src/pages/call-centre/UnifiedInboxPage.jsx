import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Inbox, MessageSquare } from 'lucide-react';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import ConversationList from '@/components/call-centre/ConversationList';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const UnifiedInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
    
    // Setup real-time updates via PocketBase (since we don't have direct access to the requested Socket implementation)
    const unsubscribe = pb.collection('conversations').subscribe('*', function (e) {
      if (e.action === 'create') {
        setConversations(prev => [e.record, ...prev]);
      } else if (e.action === 'update') {
        setConversations(prev => prev.map(c => c.id === e.record.id ? e.record : c));
      } else if (e.action === 'delete') {
        setConversations(prev => prev.filter(c => c.id !== e.record.id));
      }
    });

    return () => {
      pb.collection('conversations').unsubscribe('*');
    };
  }, [channelFilter, statusFilter, searchQuery]);

  const fetchConversations = async () => {
    try {
      let filter = [];
      if (statusFilter !== 'all') filter.push(`status = "${statusFilter}"`);
      if (channelFilter !== 'all') filter.push(`channel = "${channelFilter}"`);
      if (searchQuery) filter.push(`(customer_id.name ~ "${searchQuery}" || customer_id.phone ~ "${searchQuery}")`);
      
      // Limit view to assigned conversations or admins
      if (user?.role !== 'admin') {
        filter.push(`(assigned_agent_id = "${user?.id}" || assigned_agent_id = "")`);
      }

      const records = await pb.collection('conversations').getList(1, 50, {
        filter: filter.join(' && '),
        sort: '-updated',
        expand: 'customer_id,assigned_agent_id',
        $autoCancel: false
      });
      setConversations(records.items);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Helmet>
        <title>Unified Inbox - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full flex bg-card rounded-2xl shadow-lg border overflow-hidden">
          {/* List Sidebar */}
          <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-r h-[calc(100vh-8rem)]">
            <ConversationList 
              conversations={conversations}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              channelFilter={channelFilter}
              setChannelFilter={setChannelFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>

          {/* Empty State Area (Desktop) */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/10 text-center p-8">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Inbox className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Unified Inbox</h2>
            <p className="text-muted-foreground max-w-md">
              Select a conversation from the list to start responding across SMS, WhatsApp, Email, and Live Chat.
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Start New Chat
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnifiedInboxPage;