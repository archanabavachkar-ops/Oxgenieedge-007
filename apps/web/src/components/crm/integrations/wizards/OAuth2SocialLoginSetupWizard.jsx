import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Key } from 'lucide-react';

const OAuth2SocialLoginSetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-rose-500" /> OAuth2 Setup</DialogTitle></DialogHeader>
        <div className="py-4 space-y-6">
          <Progress value={(step / 2) * 100} />
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {['Google', 'GitHub', 'Apple', 'LinkedIn'].map(p => (
                <div key={p} className="flex items-center space-x-2"><Checkbox id={p} defaultChecked={p==='Google'} /><label htmlFor={p} className="text-sm font-medium">{p}</label></div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground">Google Configuration</h4>
              <Input placeholder="Client ID" />
              <Input placeholder="Client Secret" type="password" />
              <p className="text-xs text-muted-foreground mt-2">Redirect URI: https://yourdomain.com/auth/google/callback</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s => s-1)}>Back</Button>}
          {step < 2 ? <Button onClick={() => setStep(s => s+1)}>Next</Button> : <Button onClick={onComplete}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default OAuth2SocialLoginSetupWizard;