import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CallControls from './CallControls.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const ClickToCallButton = ({ phoneNumber, customerId, agentId, onCallInitiated, onCallEnded, disabled = false }) => {
  const [status, setStatus] = useState('idle'); // idle, initiating, ringing, connected, ended
  const [callId, setCallId] = useState(null);
  const [duration, setDuration] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval;
    if (status === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (status === 'idle' || status === 'ended') {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInitiateCall = async () => {
    if (status !== 'idle' && status !== 'ended') return;
    
    setStatus('initiating');
    try {
      const response = await apiServerClient.fetch('/click-to-call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, customerId, agentId })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate call');
      }

      setCallId(data.data.callId);
      setStatus('ringing');
      if (onCallInitiated) onCallInitiated(data.data);
      
      // Simulate connected state for demo purposes (usually done via websocket)
      setTimeout(() => setStatus('connected'), 3000);
      
    } catch (error) {
      console.error('Click to call error:', error);
      toast.error(error.message || 'Could not initiate call');
      setStatus('idle');
    }
  };

  const handleEndCall = async () => {
    if (!callId) {
      setStatus('ended');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    try {
      const response = await apiServerClient.fetch(`/click-to-call/${callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'agent_ended' })
      });
      
      if (!response.ok) throw new Error('Failed to end call properly');
      
      setStatus('ended');
      if (onCallEnded) onCallEnded({ callId, duration });
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      toast.error('Error ending call');
      setStatus('idle'); // Force reset
    }
  };

  // If call is active, show the active call interface
  if (status !== 'idle' && status !== 'ended') {
    return (
      <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border">
        <div className="flex flex-col px-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            {status === 'initiating' ? 'Initiating...' : status === 'ringing' ? 'Ringing...' : 'Connected'}
          </span>
          <span className="font-mono font-medium text-sm">
            {status === 'connected' ? formatDuration(duration) : '00:00'}
          </span>
        </div>
        
        <CallControls 
          callId={callId}
          isActive={status === 'connected'}
          onEnd={handleEndCall}
          onMute={(isMuted) => console.log('Muted:', isMuted)}
          onHold={(isOnHold) => console.log('Hold:', isOnHold)}
          onTransfer={(target) => console.log('Transfer to:', target)}
        />
      </div>
    );
  }

  // Idle state
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-primary hover:text-primary hover:bg-primary/10 border-primary/20"
            onClick={handleInitiateCall}
            disabled={disabled || status === 'initiating'}
          >
            {status === 'initiating' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PhoneCall className="h-4 w-4" />
            )}
            <span>{phoneNumber || 'Call Customer'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to call {phoneNumber}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClickToCallButton;