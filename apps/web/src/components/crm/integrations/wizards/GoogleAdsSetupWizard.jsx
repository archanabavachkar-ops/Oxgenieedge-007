import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Target } from 'lucide-react';

const GoogleAdsSetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" /> Google Ads Setup</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <Progress value={(step / totalSteps) * 100} className="mb-8" />
          {step === 1 && (
            <div className="text-center space-y-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setStep(2)}>Connect with Google</Button>
              <p className="text-xs text-muted-foreground">Grants access to adwords scopes for tracking.</p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Select Ads Account</label>
              <Select defaultValue="act1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="act1">Acme Corp Ads (123-456-7890)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s => s-1)}>Back</Button>}
          {step === totalSteps ? <Button onClick={onComplete}>Complete Setup</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default GoogleAdsSetupWizard;