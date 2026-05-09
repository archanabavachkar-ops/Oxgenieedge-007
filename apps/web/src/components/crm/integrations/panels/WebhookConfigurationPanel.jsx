import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Input } from '@/components/ui/input.jsx';

const WebhookConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Event Triggers Accepted</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {['lead_created', 'deal_updated', 'contact_added', 'payment_received'].map(ev => (
            <div key={ev} className="flex items-center space-x-2">
              <Checkbox id={ev} defaultChecked />
              <label htmlFor={ev} className="text-sm font-medium leading-none font-mono">{ev}</label>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Retry Failed Events</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center"><span className="text-sm">Enable Retry</span><Switch defaultChecked /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs">Max Attempts</label><Input type="number" defaultValue={3} /></div>
            <div className="space-y-1"><label className="text-xs">Interval (sec)</label><Input type="number" defaultValue={300} /></div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default WebhookConfigurationPanel;