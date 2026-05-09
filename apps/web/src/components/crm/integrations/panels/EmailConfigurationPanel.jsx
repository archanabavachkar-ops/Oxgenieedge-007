import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Edit2, Send } from 'lucide-react';

const EmailConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Email Templates</CardTitle>
          <Button size="sm">Create New Template</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Subject</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Welcome Intro</TableCell><TableCell>Welcome to Acme Corp!</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm"><Edit2 className="w-4 h-4"/></Button></TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Bulk Sending</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-sm">Enable Bulk</span><Switch /></div>
            <Input type="number" placeholder="Max Emails Per Day" defaultValue={500} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Tracking</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-sm">Open Tracking</span><Switch defaultChecked /></div>
            <div className="flex justify-between"><span className="text-sm">Click Tracking</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border">
        <Input placeholder="test@domain.com" className="max-w-[250px]" />
        <Button variant="secondary"><Send className="w-4 h-4 mr-2"/> Send Test Email</Button>
      </div>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default EmailConfigurationPanel;