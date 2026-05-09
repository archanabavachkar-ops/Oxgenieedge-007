import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const GoogleAdsConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campaign Mapping</CardTitle>
          <Button size="sm" variant="outline">Fetch Campaigns</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Pipeline</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Summer Promo 2026</TableCell>
                <TableCell>
                  <Select defaultValue="sales"><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sales">Sales Pipeline</SelectItem></SelectContent></Select>
                </TableCell>
                <TableCell><span className="text-success text-xs font-bold">Active</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Track Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm">Cost per Lead Tracking</span><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><span className="text-sm">Conversion Tracking</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">AI Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/40 rounded-lg text-sm border flex justify-between items-center">
              <div><p className="font-medium text-warning">High CPL Detected</p><p className="text-xs text-muted-foreground">'Winter Ads' cost increased 40%</p></div>
              <Button size="sm" variant="secondary" className="h-7 text-xs">Pause</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default GoogleAdsConfigurationPanel;