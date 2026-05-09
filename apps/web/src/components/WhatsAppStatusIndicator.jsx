import React from 'react';
import { useWhatsAppData } from '@/hooks/useWhatsAppData.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import { cn } from '@/lib/utils.js';

export default function WhatsAppStatusIndicator({ className }) {
  const { settings, loadingSettings } = useWhatsAppData();

  const isConnected = settings?.isConnected;

  if (loadingSettings) {
    return <div className={cn("w-3 h-3 rounded-full bg-muted animate-pulse", className)} />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center justify-center", className)}>
            <div className={cn(
              "w-3 h-3 rounded-full shadow-sm",
              isConnected ? "bg-success shadow-success/50" : "bg-destructive shadow-destructive/50"
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}