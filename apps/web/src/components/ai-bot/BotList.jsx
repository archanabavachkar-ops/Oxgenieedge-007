import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bot, Edit, Play, Trash2, Eye, Activity, Settings2 } from 'lucide-react';
import { format } from 'date-fns';

const BotList = ({ bots, viewMode = 'table', selectedIds, onToggleSelect, onToggleAll, onEdit, onTest, onDelete, onViewAnalytics }) => {
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-[hsl(var(--status-online))] hover:bg-[hsl(var(--status-online))/80] text-white">Online</Badge>;
      case 'training':
        return <Badge className="bg-[hsl(var(--status-training))] hover:bg-[hsl(var(--status-training))/80] text-white">Training</Badge>;
      default:
        return <Badge className="bg-[hsl(var(--status-offline))] hover:bg-[hsl(var(--status-offline))/80] text-white">Offline</Badge>;
    }
  };

  const allSelected = bots.length > 0 && selectedIds.length === bots.length;

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id} className="relative group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-4 left-4 z-10">
              <Checkbox 
                checked={selectedIds.includes(bot.id)} 
                onCheckedChange={() => onToggleSelect(bot.id)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
            <CardHeader className="pb-2 pt-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-bot-secondary text-bot-secondary-foreground">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5 capitalize">{bot.type || 'Standard Bot'}</p>
                  </div>
                </div>
                {getStatusBadge(bot.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Convos
                  </span>
                  <span className="font-semibold tabular-nums">{bot.conversations?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Settings2 className="h-3 w-3" /> Success
                  </span>
                  <span className="font-semibold tabular-nums">{bot.successRate || 0}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-4 flex justify-between gap-2">
              <Button variant="ghost" size="sm" className="h-8 flex-1" onClick={() => onEdit(bot)}>
                <Edit className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="h-8 flex-1" onClick={() => onTest(bot)}>
                <Play className="h-4 w-4 mr-2 text-bot-primary" /> Test
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => onDelete(bot)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[50px] text-center">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
            </TableHead>
            <TableHead>Bot Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Conversations</TableHead>
            <TableHead className="text-right">Success Rate</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bots.map((bot) => (
            <TableRow key={bot.id} className="hover:bg-muted/20 transition-colors">
              <TableCell className="text-center">
                <Checkbox 
                  checked={selectedIds.includes(bot.id)} 
                  onCheckedChange={() => onToggleSelect(bot.id)} 
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bot-secondary text-bot-secondary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="font-medium">{bot.name}</div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(bot.status)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {bot.conversations?.toLocaleString() || 0}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="font-medium">{bot.successRate || 0}%</span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {bot.lastActive ? format(new Date(bot.lastActive), 'MMM d, HH:mm') : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewAnalytics(bot)} aria-label="Analytics">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTest(bot)} aria-label="Test">
                    <Play className="h-4 w-4 text-bot-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(bot)} aria-label="Edit">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(bot)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {bots.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                No bots found. Create your first AI bot to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BotList;