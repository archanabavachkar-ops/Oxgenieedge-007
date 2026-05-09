import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Users, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';

export default function AgentPerformanceTable({ agents, isLoading }) {
  if (isLoading) return <Card className="h-[300px]"><CardContent className="p-6"><Skeleton className="h-40 w-full"/></CardContent></Card>;
  if (!agents || agents.length === 0) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-founder-primary" />
          Agent Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Calls</TableHead>
              <TableHead className="text-right">Conv. Rate</TableHead>
              <TableHead className="text-right">Response Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.slice(0, 5).map((agent, idx) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  {idx === 0 && <Trophy className="h-4 w-4 text-warning" />}
                  {agent.name}
                </TableCell>
                <TableCell className="text-right">{agent.calls}</TableCell>
                <TableCell className="text-right text-success font-medium">{agent.convRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-muted-foreground">{agent.resTime}m</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}