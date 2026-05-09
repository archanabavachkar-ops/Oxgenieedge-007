import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const WhatsAppConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Management</CardTitle>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Template</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Language</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">welcome_message</TableCell><TableCell>en_US</TableCell><TableCell><span className="text-success text-sm font-medium">Approved</span></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon"><Settings2 className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Auto-reply Rules</CardTitle>
          <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 p-4 bg-muted/30 rounded-xl border">
            <div className="flex items-center gap-4">
              <Input defaultValue="HELP" className="max-w-[150px] font-mono text-sm" />
              <Textarea defaultValue="Our support team will be with you shortly." className="min-h-[40px] flex-1" />
              <Switch defaultChecked />
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chatbot Flow Builder</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 bg-muted/10 border-t border-b border-dashed my-4">
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">Visually design conversation paths, automated responses, and lead capture sequences.</p>
          <Button variant="secondary" onClick={() => toast.info('Flow builder opening soon')}>Open Visual Builder</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Configuration saved')}>Save Configuration</Button>
      </div>
    </div>
  );
};
export default WhatsAppConfigurationPanel;