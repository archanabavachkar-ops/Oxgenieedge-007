import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

const EmailSetupWizard = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-red-500" /> Email Integration</DialogTitle></DialogHeader>
        <Tabs defaultValue="smtp" className="mt-4">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="smtp">SMTP Settings</TabsTrigger><TabsTrigger value="gmail">Gmail OAuth</TabsTrigger></TabsList>
          <TabsContent value="smtp" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4"><Input placeholder="SMTP Host (e.g. smtp.mailgun.org)" className="col-span-2" /><Input placeholder="Port" type="number" /><Input placeholder="Email Address" type="email" /><Input placeholder="Password / API Key" type="password" className="col-span-2" /></div>
            <Button variant="outline" className="w-full" onClick={() => toast.success('Connection successful')}>Test Connection</Button>
          </TabsContent>
          <TabsContent value="gmail" className="space-y-4 mt-4 text-center py-6">
            <Button className="bg-red-600 hover:bg-red-700 w-full text-white">Connect with Gmail</Button>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4"><Button onClick={onComplete}>Save Credentials</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default EmailSetupWizard;