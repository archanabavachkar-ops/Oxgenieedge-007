import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Webhook, Copy } from 'lucide-react';
import { toast } from 'sonner';

const WebhookSetupWizard = ({ isOpen, onClose, onComplete }) => {
  const mockUrl = "https://api.domain.com/webhooks/crm/tk_8x9a2b";
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Webhook className="w-5 h-5 text-purple-500" /> Webhook Receiver</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Your Webhook URL</label>
            <div className="flex gap-2">
              <Input readOnly value={mockUrl} className="font-mono text-xs bg-muted" />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(mockUrl)}><Copy className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Sample Payload</label>
            <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 text-xs overflow-x-auto">
{`{
  "event": "lead_created",
  "data": {
    "email": "user@example.com",
    "name": "Alex Jenkins"
  }
}`}
            </pre>
          </div>
        </div>
        <DialogFooter><Button onClick={onComplete}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default WebhookSetupWizard;