import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Sparkles, Copy, Check } from 'lucide-react';
import IntegratedAiChat from '@/components/integrated-ai-chat.jsx';
import { toast } from 'sonner';

const EXAMPLE_PROMPTS = [
  "Generate a marketing email for a new product launch",
  "Create an image of a futuristic city",
  "Summarize our latest CRM features",
  "Draft a response to a customer complaint"
];

export default function AIAssistantPopup({ isOpen, onClose, onMinimize }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Prompt copied! Paste it in the chat below.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: isOpen ? 1 : 0, 
        y: isOpen ? 0 : 50, 
        pointerEvents: isOpen ? 'auto' : 'none',
        scale: isOpen ? 1 : 0.95
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      drag
      dragConstraints={{ left: -500, right: 50, top: -500, bottom: 50 }}
      dragElastic={0.1}
      className="fixed bottom-[70px] right-2 md:bottom-[90px] md:right-8 w-[calc(100vw-16px)] max-w-[500px] md:w-[400px] h-[500px] md:h-[600px] bg-[#1F2937] rounded-xl border-2 border-[#F97316] shadow-2xl flex flex-col overflow-hidden z-50"
      role="dialog"
      aria-label="AI Assistant Chat"
    >
      {/* Header */}
      <div className="bg-[#111827] p-4 flex items-center justify-between border-b border-gray-800 cursor-move">
        <div className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="w-5 h-5 text-[#F97316]" />
          AI Assistant
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onMinimize} 
            aria-label="Minimize AI Assistant" 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose} 
            aria-label="Close AI Assistant" 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-[#1F2937]">
        <div className="p-4 border-b border-gray-800 bg-[#111827]/50">
          <p className="text-white font-medium mb-3">Hello! 👋 How can I help you today?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(prompt, idx)}
                className="text-left text-xs bg-[#F97316] hover:bg-[#EA580C] text-white p-2.5 rounded-lg transition-all flex justify-between items-center group shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <span className="truncate pr-2">{prompt}</span>
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 relative min-h-0">
          <IntegratedAiChat />
        </div>
      </div>
    </motion.div>
  );
}