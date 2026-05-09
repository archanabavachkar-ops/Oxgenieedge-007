import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';

const OnlineStoreConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Catalog Overview</CardTitle><Button size="sm" variant="outline">Manage Products</Button></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Premium CRM License</TableCell><TableCell>$299.00</TableCell><TableCell>Digital</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Checkout Flow</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm">Guest Checkout</span><Switch /></div>
            <div className="flex justify-between items-center"><span className="text-sm">Enable Coupons</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default OnlineStoreConfigurationPanel;