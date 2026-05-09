import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessCredentialsModal({ isOpen, onClose, credentials }) {
  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  if (!credentials) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <DialogTitle className="text-2xl font-bold">Partner Account Created!</DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Credentials have been sent to the partner's email address.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Partner ID */}
          <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Partner ID</p>
              <p className="font-mono text-foreground font-medium">{credentials.partnerId}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#F97316] border-[#F97316]/30 hover:bg-[#F97316]/10"
              onClick={() => handleCopy(credentials.partnerId, 'Partner ID')}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          {/* Username */}
          <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Login Username</p>
              <p className="font-mono text-foreground font-medium">{credentials.username}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#F97316] border-[#F97316]/30 hover:bg-[#F97316]/10"
              onClick={() => handleCopy(credentials.username, 'Username')}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          {/* Password */}
          <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Login Password</p>
              <p className="font-mono text-foreground font-medium">{credentials.password}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#F97316] border-[#F97316]/30 hover:bg-[#F97316]/10"
              onClick={() => handleCopy(credentials.password, 'Password')}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          {credentials.accountManagerName && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Assigned Account Manager: <span className="font-medium text-foreground">{credentials.accountManagerName}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            className="w-full bg-[#6B7280] hover:bg-[#4B5563] text-white" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}