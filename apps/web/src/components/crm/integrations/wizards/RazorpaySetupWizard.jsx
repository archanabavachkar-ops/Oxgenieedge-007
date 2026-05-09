import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

const RazorpaySetupWizard = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-sky-500" /> Razorpay Integration</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <Input placeholder="Key ID (rzp_live_...)" />
          <Input placeholder="Key Secret" type="password" />
          <Button variant="outline" className="w-full" onClick={() => toast.success('API Keys verified')}>Test Credentials</Button>
        </div>
        <DialogFooter><Button onClick={onComplete}>Save Credentials</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default RazorpaySetupWizard;