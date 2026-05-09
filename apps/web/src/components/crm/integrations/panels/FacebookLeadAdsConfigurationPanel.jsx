import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const FacebookLeadAdsConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Field Mapping</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Facebook Form Field</TableHead><TableHead>CRM Property</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">full_name</TableCell>
                <TableCell><Select defaultValue="name"><SelectTrigger className="h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="name">Name</SelectItem></SelectContent></Select></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">work_email</TableCell>
                <TableCell><Select defaultValue="email"><SelectTrigger className="h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="email">Email</SelectItem></SelectContent></Select></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Auto Lead Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm">Enable Auto-Assignment</span><Switch defaultChecked /></div>
            <Select defaultValue="u1"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="u1">John Doe (Sales rep)</SelectItem></SelectContent></Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Duplicate Detection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm">Enable Detection</span><Switch defaultChecked /></div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Email Field" defaultValue="email" className="text-xs" />
              <Input placeholder="Phone Field" defaultValue="phone" className="text-xs" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default FacebookLeadAdsConfigurationPanel;