import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Lead', count: 4000 }, { name: 'Qualified', count: 2400 }, { name: 'Proposal', count: 1200 }, { name: 'Won', count: 800 }
];

const AnalyticsDashboardConfigurationPanel = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Funnel Configuration</CardTitle>
          <Select defaultValue="sales"><SelectTrigger className="w-[180px] h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sales">Sales Pipeline</SelectItem></SelectContent></Select>
        </CardHeader>
        <CardContent className="h-[250px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} layout="vertical" margin={{top:5, right:30, left:20, bottom:5}}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 12}} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: '1px solid var(--border)'}} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0,4,4,0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button>Save Configuration</Button></div>
    </div>
  );
};
export default AnalyticsDashboardConfigurationPanel;