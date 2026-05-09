import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';

const StripeConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center"><CardTitle>Subscription Plans</CardTitle><Button size="sm">Sync Plans</Button></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Plan Name</TableHead><TableHead>Amount</TableHead><TableHead>Interval</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Pro Tier</TableCell><TableCell>$49.00</TableCell><TableCell>Monthly</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Payment Tracking</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Auto-create CRM Records</span><Switch defaultChecked /></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Auto-update Deal Stage</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Failed Payments</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Enable Handling</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default StripeConfigurationPanel;