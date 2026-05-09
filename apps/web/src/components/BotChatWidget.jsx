import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useBotEngine } from '@/hooks/useBotEngine.js';
import EscalationPanel from './EscalationPanel.jsx';
import AutomationTriggersManager from './AutomationTriggersManager.jsx';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import { cn } from '@/lib/utils.js';

// Demo constant, in a real app this would come from a selected conversation or auth
const DEMO_CONVERSATION_ID = "test_conv_001";
const DEMO_CUSTOMER_ID = "test_cust_001";

export default function BotChatWidget({ templates = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isTyping, respondToMessage, loadConversationMessages } = useBotEngine();
  const scrollRef = useRef(null);

  // Optionally load demo conversation history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadConversationMessages(DEMO_CONVERSATION_ID);
    }
  }, [isOpen, messages.length, loadConversationMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue;
    setInputValue('');
    
    await respondToMessage(text, DEMO_CONVERSATION_ID, DEMO_CUSTOMER_ID, templates);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-bot-primary text-bot-primary-foreground hover:brightness-110"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-bot-primary text-bot-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-bot-primary-foreground/20 p-2 rounded-full">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-bot-primary-foreground/80">Online & ready to help</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-bot-primary-foreground hover:bg-bot-primary-foreground/20 hover:text-bot-primary-foreground rounded-full transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Logic Panels */}
      <EscalationPanel conversationId={DEMO_CONVERSATION_ID} />
      <AutomationTriggersManager conversationId={DEMO_CONVERSATION_ID} />

      {/* Messages Area */}
      <ScrollArea className="flex-1 h-[400px] p-4 bg-muted/30" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Send a message to test the bot engine.</p>
              <p className="text-xs mt-1">Try: "demo", "pricing", or "talk to human".</p>
            </div>
          )}
          
          {messages.map((msg, idx) => {
            const isBot = msg.direction === 'outbound' || msg.sender === 'bot' || msg.sender === 'system' || msg.sender === 'bot_engine';
            const isSystem = msg.sender === 'system';
            
            return (
              <div key={msg.id || idx} className={cn("flex flex-col max-w-[85%]", isBot ? "items-start" : "items-end ml-auto")}>
                <div className="flex items-end gap-2 mb-1">
                  {isBot && !isSystem && <Bot className="h-4 w-4 text-muted-foreground mb-1" />}
                  <div className={cn(
                    "px-4 py-2 text-sm shadow-sm transition-all",
                    isSystem ? "bg-accent text-accent-foreground rounded-lg border text-xs w-full text-center" :
                    isBot ? "message-bubble-received" : "message-bubble-sent"
                  )}>
                    {msg.content}
                  </div>
                  {!isBot && <User className="h-4 w-4 text-muted-foreground mb-1" />}
                </div>
                
                {isBot && msg.intent_detected && (
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-background shadow-sm border-border/50">
                      Intent: {msg.intent_detected}
                    </Badge>
                    {msg.confidence_score !== undefined && (
                      <ConfidenceBadge confidence={msg.confidence_score} showLabel={true} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex items-start gap-2 max-w-[85%]">
              <Bot className="h-4 w-4 text-muted-foreground mt-2" />
              <div className="message-bubble-received px-4 py-3 shadow-sm flex gap-1 items-center h-9">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-background border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-muted/50 border-border focus-visible:ring-1 focus-visible:bg-background transition-colors"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || isTyping}
            className="rounded-full shrink-0 bg-bot-primary text-bot-primary-foreground hover:brightness-110 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}