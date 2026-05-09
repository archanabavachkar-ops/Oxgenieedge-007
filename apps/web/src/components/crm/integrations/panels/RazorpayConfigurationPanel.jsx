import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Input } from '@/components/ui/input.jsx';

const RazorpayConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2"><Switch id="upi" defaultChecked /><label htmlFor="upi" className="text-sm">UPI</label></div>
          <div className="flex items-center space-x-2"><Switch id="net" defaultChecked /><label htmlFor="net" className="text-sm">Net Banking</label></div>
          <div className="flex items-center space-x-2"><Switch id="card" defaultChecked /><label htmlFor="card" className="text-sm">Cards</label></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Payment Link Generator</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Amount (INR)" type="number" className="max-w-[150px]" />
          <Input placeholder="Description" className="flex-1" />
          <Button variant="secondary">Generate Link</Button>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default RazorpayConfigurationPanel;