import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const WhatsAppSetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleConnectMeta = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); handleNext(); }, 1500);
  };

  const handleFinish = () => {
    toast.success('WhatsApp connected successfully!');
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500" /> WhatsApp Business Setup</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Progress value={(step / totalSteps) * 100} className="mb-6" />
          
          {step === 1 && (
            <div className="text-center py-8 space-y-4">
              <h3 className="text-lg font-medium">Connect Meta Account</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">Authorize CRM to access your WhatsApp Business messaging capabilities.</p>
              <Button onClick={handleConnectMeta} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Connecting...' : 'Connect with Meta'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select WABA Account</h3>
              <Select defaultValue="acc1">
                <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="acc1">Global Roasters (+1 555-0199)</SelectItem>
                  <SelectItem value="acc2">Support Desk (+1 555-0198)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Verify Phone Number</h3>
              <div className="flex gap-2">
                <Input placeholder="Verification Code" className="text-center tracking-widest font-mono" />
                <Button variant="outline">Send Code</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-medium">Sync Templates</h3>
              <p className="text-sm text-muted-foreground">Fetch your approved message templates from Meta.</p>
              <Button variant="secondary" className="w-full">Sync 12 Templates</Button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <CheckCircle2 className="w-12 h-12 text-success" />
                <h3 className="text-lg font-medium">Ready to Test!</h3>
              </div>
              <div className="flex gap-2">
                <Input placeholder="+1 234 567 8900" />
                <Button variant="outline">Send Test</Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 1}>Previous</Button>
          {step < totalSteps ? (
            <Button onClick={handleNext}>Next Step</Button>
          ) : (
            <Button onClick={handleFinish} className="bg-success hover:bg-success/90 text-success-foreground">Save & Finish</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default WhatsAppSetupWizard;