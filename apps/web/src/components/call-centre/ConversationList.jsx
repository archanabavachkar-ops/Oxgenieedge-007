import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Mail, MessageCircle, Smartphone, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ChannelIcon = ({ channel, className }) => {
  switch (channel?.toLowerCase()) {
    case 'whatsapp': return <MessageCircle className={cn("text-channel-whatsapp", className)} />;
    case 'email': return <Mail className={cn("text-channel-email", className)} />;
    case 'sms': return <Smartphone className={cn("text-channel-sms", className)} />;
    default: return <MessageSquare className={cn("text-channel-chat", className)} />;
  }
};

const ConversationList = ({ 
  conversations = [], 
  activeId, 
  searchQuery, 
  setSearchQuery,
  channelFilter,
  setChannelFilter,
  statusFilter,
  setStatusFilter
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 space-y-4 border-b">
        <Input 
          placeholder="Search name, email, or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="chat">Live Chat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conv) => {
              const customerName = conv.expand?.customer_id?.name || 'Unknown Customer';
              const isActive = activeId === conv.id;
              const isUnread = conv.unread_count > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/call-centre/conversations/${conv.id}`)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3 relative",
                    isActive && "bg-accent hover:bg-accent",
                    isUnread && !isActive && "bg-muted/20"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                  
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={conv.expand?.customer_id?.avatar} />
                      <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                      <ChannelIcon channel={conv.channel} className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={cn("text-sm truncate", isUnread ? "font-bold text-foreground" : "font-medium text-foreground/90")}>
                        {customerName}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {conv.updated ? formatDistanceToNow(new Date(conv.updated), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <p className={cn("text-xs truncate", isUnread ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {conv.status === 'closed' ? 'Conversation closed' : 'Click to view messages'}
                      </p>
                      {isUnread && (
                        <Badge variant="default" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px]">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;