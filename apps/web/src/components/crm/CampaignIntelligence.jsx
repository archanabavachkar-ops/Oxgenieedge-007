import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowUpRight, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const CampaignIntelligence = ({ campaigns = [] }) => {
  if (campaigns.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Sent</TableHead>
            <TableHead className="text-right">Open Rate</TableHead>
            <TableHead className="text-right">Conversion</TableHead>
            <TableHead>AI Suggestion</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((camp, idx) => (
            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium text-foreground">{camp.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  camp.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground"
                )}>
                  {camp.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">{camp.sentCount.toLocaleString()}</TableCell>
              <TableCell className="text-right font-medium">{camp.openRate}%</TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "flex items-center justify-end gap-1 font-medium",
                  camp.conversionRate < 2 ? "text-destructive" : "text-emerald-600"
                )}>
                  {camp.conversionRate < 2 && <TrendingDown className="w-3 h-3" />}
                  {camp.conversionRate}%
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {camp.suggestion}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                  Optimize <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignIntelligence;