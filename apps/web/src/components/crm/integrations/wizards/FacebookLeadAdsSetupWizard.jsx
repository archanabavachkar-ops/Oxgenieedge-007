import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Facebook } from 'lucide-react';

const FacebookLeadAdsSetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Facebook className="w-5 h-5 text-blue-500" /> Facebook Lead Ads</DialogTitle></DialogHeader>
        <div className="py-6 space-y-6">
          <Progress value={(step / 3) * 100} />
          {step === 1 && <Button className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90" onClick={() => setStep(2)}>Connect with Meta</Button>}
          {step === 2 && (
            <div className="space-y-2"><label className="text-sm">Select Page</label>
              <Select defaultValue="p1"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="p1">Acme Official</SelectItem></SelectContent></Select>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2"><label className="text-sm">Select Lead Form</label>
              <Select defaultValue="f1"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="f1">Q2 Lead Gen Form</SelectItem></SelectContent></Select>
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s => s-1)}>Back</Button>}
          {step < 3 ? <Button onClick={() => setStep(s => s+1)} disabled={step===1}>Next</Button> : <Button onClick={onComplete}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default FacebookLeadAdsSetupWizard;