import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Pause, Play, PhoneForwarded, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CallControls = ({ callId, isActive, onMute, onHold, onTransfer, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const handleMute = () => {
    if (!isActive) return;
    const newState = !isMuted;
    setIsMuted(newState);
    if (onMute) onMute(newState);
  };

  const handleHold = () => {
    if (!isActive) return;
    const newState = !isOnHold;
    setIsOnHold(newState);
    if (onHold) onHold(newState);
  };

  const handleTransfer = (agentId) => {
    if (!isActive) return;
    if (onTransfer) onTransfer(agentId);
  };

  const handleEnd = () => {
    if (!isActive) return;
    if (onEnd) onEnd();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (!isActive) return;

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          handleMute();
          break;
        case 'h':
          e.preventDefault();
          handleHold();
          break;
        case 'e':
          e.preventDefault();
          handleEnd();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isMuted, isOnHold]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 bg-card border rounded-full p-1.5 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? "secondary" : "ghost"}
              size="icon"
              className={`rounded-full h-10 w-10 transition-all ${isMuted ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''}`}
              onClick={handleMute}
              disabled={!isActive}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Mute (M)</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isOnHold ? "secondary" : "ghost"}
              size="icon"
              className={`rounded-full h-10 w-10 transition-all ${isOnHold ? 'bg-warning/10 text-warning hover:bg-warning/20' : ''}`}
              onClick={handleHold}
              disabled={!isActive}
            >
              {isOnHold ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isOnHold ? 'Resume' : 'Hold'} (H)</p></TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  disabled={!isActive}
                >
                  <PhoneForwarded className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Transfer</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuLabel>Transfer to Agent</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleTransfer('agent_1')}>Sarah Jenkins (Sales)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTransfer('agent_2')}>Michael Chen (Support)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTransfer('agent_3')}>Emma Davis (Billing)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-destructive/90"
              onClick={handleEnd}
              disabled={!isActive}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>End Call (E)</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default CallControls;