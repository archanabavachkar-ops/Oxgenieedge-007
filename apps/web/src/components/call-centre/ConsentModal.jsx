import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ConsentModal = ({ isOpen, onAccept, onDecline, customerId, expiryDate = null }) => {
  const [consents, setConsents] = useState({
    recording: false,
    marketing: false,
    data: false
  });

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setConsents({ recording: false, marketing: false, data: false });
    }
  }, [isOpen]);

  const handleCheckedChange = (key, checked) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept({ customerId, consents });
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline({ customerId });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Determine if primary consent is given
  const canAccept = consents.recording || consents.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Compliance & Consent</DialogTitle>
          </div>
          <DialogDescription>
            Requesting customer permissions according to regulatory requirements. Read these terms to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-4 rounded-lg border border-border mt-2 space-y-4">
          <div className="text-sm text-muted-foreground flex items-start gap-2 pb-2 border-b">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              "For quality and training purposes, may we record this call? We may also use your data to improve our services."
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent-recording" 
                checked={consents.recording}
                onCheckedChange={(c) => handleCheckedChange('recording', c)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent-recording" className="font-medium cursor-pointer">Call Recording Consent *</Label>
                <p className="text-xs text-muted-foreground">Allows storing and transcribing the conversation.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent-data" 
                checked={consents.data}
                onCheckedChange={(c) => handleCheckedChange('data', c)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent-data" className="font-medium cursor-pointer">Data Processing Consent *</Label>
                <p className="text-xs text-muted-foreground">Allows AI analysis and data storage in CRM.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent-marketing" 
                checked={consents.marketing}
                onCheckedChange={(c) => handleCheckedChange('marketing', c)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent-marketing" className="font-medium cursor-pointer">Marketing Communication (Optional)</Label>
                <p className="text-xs text-muted-foreground">Allows sending follow-up promotional materials.</p>
              </div>
            </div>
          </div>
        </div>

        {expiryDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Consent valid until: {formatDate(expiryDate)}</span>
          </div>
        )}

        <DialogFooter className="mt-4 sm:justify-between">
          <Button variant="destructive" onClick={handleDecline} type="button">
            Customer Declined
          </Button>
          <Button onClick={handleAccept} disabled={!canAccept} type="button">
            Confirm Consent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;