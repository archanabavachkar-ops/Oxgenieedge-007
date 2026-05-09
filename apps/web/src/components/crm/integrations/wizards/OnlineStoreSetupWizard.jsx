import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';

const OnlineStoreSetupWizard = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-500" /> Store Enablement</DialogTitle></DialogHeader>
        <div className="py-6">
          <Alert className="bg-primary/10 border-primary/20 text-foreground flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <AlertDescription className="text-sm">Enabling the Online Store module will activate product catalogs, inventory tracking, and the checkout flow natively.</AlertDescription>
          </Alert>
        </div>
        <DialogFooter><Button onClick={onComplete}>Enable Store Module</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default OnlineStoreSetupWizard;