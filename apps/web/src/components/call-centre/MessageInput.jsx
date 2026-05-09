import React, { useState } from 'react';
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const getChannelLimits = (channel) => {
  switch (channel?.toLowerCase()) {
    case 'sms': return { limit: 160, showSubject: false };
    case 'whatsapp': return { limit: 4096, showSubject: false };
    case 'email': return { limit: null, showSubject: true };
    default: return { limit: null, showSubject: false };
  }
};

const MessageInput = ({ channel, onSend, isSending = false, error = null }) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  
  const { limit, showSubject } = getChannelLimits(channel);
  const remaining = limit ? limit - content.length : null;
  const isOverLimit = limit && remaining < 0;

  const handleSend = () => {
    if (!content.trim() || isOverLimit || isSending) return;
    if (showSubject && !subject.trim()) return;

    onSend({ content, subject });
    setContent('');
    setSubject('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t">
      {error && (
        <Alert variant="destructive" className="mb-3 py-2 px-3 h-auto min-h-0">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 rounded-xl border bg-card focus-within:ring-1 focus-within:ring-ring focus-within:border-ring shadow-sm p-1 transition-all">
        {showSubject && (
          <div className="px-2 pt-1 border-b">
            <Input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject..."
              className="border-0 shadow-none focus-visible:ring-0 px-1 h-8 rounded-none"
            />
          </div>
        )}
        
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type a message via ${channel || 'Chat'}...`}
          className="min-h-[80px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 p-3"
        />
        
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {limit && (
              <span className={cn(
                "text-xs font-medium tabular-nums",
                isOverLimit ? "text-destructive" : remaining < 20 ? "text-warning" : "text-muted-foreground"
              )}>
                {remaining}
              </span>
            )}
            <Button 
              size="sm" 
              onClick={handleSend}
              disabled={!content.trim() || isOverLimit || isSending || (showSubject && !subject.trim())}
              className="h-8 rounded-lg px-4"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;