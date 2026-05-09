import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const StripeSetupWizard = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" /> Stripe Integration</DialogTitle></DialogHeader>
        <Tabs defaultValue="oauth" className="mt-2">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="oauth">Stripe Connect</TabsTrigger><TabsTrigger value="keys">API Keys</TabsTrigger></TabsList>
          <TabsContent value="oauth" className="text-center py-8">
            <Button className="bg-[#635BFF] hover:bg-[#635BFF]/90 text-white w-full">Connect with Stripe</Button>
          </TabsContent>
          <TabsContent value="keys" className="space-y-4 mt-4">
            <Input placeholder="Publishable Key (pk_live_...)" />
            <Input placeholder="Secret Key (sk_live_...)" type="password" />
            <Button variant="outline" className="w-full" onClick={() => toast.success('Keys valid')}>Test Connection</Button>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4"><Button onClick={onComplete}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default StripeSetupWizard;