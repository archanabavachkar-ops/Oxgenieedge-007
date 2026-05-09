import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { BarChart3, CheckCircle2 } from 'lucide-react';

const AnalyticsDashboardSetupWizard = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-500" /> Analytics Enablement</DialogTitle></DialogHeader>
        <div className="py-6">
          <Alert className="bg-success/10 border-success/20 text-success flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <AlertDescription className="text-sm font-medium">Analytics Dashboard is natively integrated with your CRM data. No API keys required.</AlertDescription>
          </Alert>
        </div>
        <DialogFooter><Button onClick={onComplete}>Enable Module</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AnalyticsDashboardSetupWizard;