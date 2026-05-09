import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import IntegratedAiChat from '@/components/integrated-ai-chat';
import { useIntegratedAi } from '@/hooks/use-integrated-ai';
import { createLeadFromSource } from '@/lib/crmUtils';

// Regular expression to identify standard emails
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages } = useIntegratedAi();
  const [capturedEmails, setCapturedEmails] = useState(new Set());

  // Automatically attempt to extract emails from user messages to create leads
  useEffect(() => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return;

    messages.forEach((msg) => {
      if (msg && msg.role === 'user') {
        // ROOT CAUSE FIX: The useIntegratedAi hook already parses the raw PocketBase 
        // content blocks into a plain string for msg.content. 
        // Calling .filter() on a string throws "msg.content.filter is not a function".
        // We must treat msg.content as a string directly.
        const textContent = typeof msg.content === 'string' ? msg.content : '';
        
        if (!textContent) return;

        const match = textContent.match(emailRegex);
        
        if (match && match[0]) {
          const email = match[0];
          if (!capturedEmails.has(email)) {
            // New email found in chat, attempt to auto-create lead
            createLeadFromSource({
              email: email,
              source: 'chatbot_chat',
              description: 'Lead auto-captured from chatbot conversation.'
            });
            setCapturedEmails(prev => new Set(prev).add(email));
          }
        }
      }
    });
  }, [messages, capturedEmails]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">O</span>
              </div>
              <div>
                <p className="font-semibold">Oxgenie Assistant</p>
                <p className="text-xs opacity-90">How can I help you today?</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <IntegratedAiChat />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
};

export default ChatbotWidget;