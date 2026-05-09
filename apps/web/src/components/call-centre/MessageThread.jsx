import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle, MessageSquare, Smartphone, Mail, MessageCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const MessageStatus = ({ status, direction }) => {
  if (direction === 'inbound') return null;

  switch (status) {
    case 'sent':
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case 'read':
      return <CheckCheck className="h-3 w-3 text-primary" />;
    case 'failed':
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
};

const ChannelIndicator = ({ channel }) => {
  switch (channel?.toLowerCase()) {
    case 'whatsapp': return <MessageCircle className="h-3 w-3 text-channel-whatsapp" />;
    case 'email': return <Mail className="h-3 w-3 text-channel-email" />;
    case 'sms': return <Smartphone className="h-3 w-3 text-channel-sms" />;
    default: return <MessageSquare className="h-3 w-3 text-channel-chat" />;
  }
};

const MessageThread = ({ messages = [], isLoading = false, customer, agent }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("flex gap-3 max-w-[80%]", i % 2 === 0 ? "ml-auto flex-row-reverse" : "")}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-64 rounded-xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium text-foreground">No messages yet</p>
        <p className="text-sm text-center max-w-sm mt-1">
          Start the conversation by sending a message below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted space-y-6 bg-muted/10">
      {messages.map((msg, idx) => {
        const isOutbound = msg.direction === 'outbound';
        const showAvatar = idx === 0 || messages[idx - 1].direction !== msg.direction;
        
        return (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-3 w-full",
              isOutbound ? "justify-end" : "justify-start"
            )}
          >
            {!isOutbound && (
              <div className="shrink-0 w-8">
                {showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer?.avatar} />
                    <AvatarFallback className="bg-secondary text-xs"><User className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}

            <div className={cn("flex flex-col max-w-[75%] sm:max-w-[65%]", isOutbound ? "items-end" : "items-start")}>
              {showAvatar && (
                <div className="flex items-center gap-1.5 mb-1 mx-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isOutbound ? (agent?.name || 'Agent') : (customer?.name || 'Customer')}
                  </span>
                  <ChannelIndicator channel={msg.channel} />
                </div>
              )}
              
              <div 
                className={cn(
                  "px-4 py-2.5 text-sm shadow-sm",
                  isOutbound ? "message-bubble-sent" : "message-bubble-received border border-border/50"
                )}
              >
                {msg.subject && (
                  <div className="font-semibold mb-1 pb-1 border-b border-current/10">
                    {msg.subject}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-1 mx-1">
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(msg.created), 'HH:mm')}
                </span>
                <MessageStatus status={msg.status} direction={msg.direction} />
              </div>
            </div>

            {isOutbound && (
              <div className="shrink-0 w-8">
                {showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{agent?.name?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageThread;