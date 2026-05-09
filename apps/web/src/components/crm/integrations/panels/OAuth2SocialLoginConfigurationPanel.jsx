import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const OAuth2SocialLoginConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Active Providers & Redirects</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Redirect URI</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Google</TableCell>
                <TableCell className="font-mono text-xs">/auth/google/callback</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={()=>toast.success('Copied')}><Copy className="w-4 h-4"/></Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>User Sync Logic</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center"><span className="text-sm">Auto-create CRM Contacts on first login</span><Switch defaultChecked /></div>
          <div className="flex justify-between items-center"><span className="text-sm">Auto-update Contact Info (Name, Avatar)</span><Switch defaultChecked /></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default OAuth2SocialLoginConfigurationPanel;