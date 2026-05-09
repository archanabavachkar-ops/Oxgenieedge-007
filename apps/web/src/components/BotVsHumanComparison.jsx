import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Bot, User, Clock, CheckCircle2, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';

export default function BotVsHumanComparison({ data, isLoading }) {
  if (isLoading) return <Card className="h-[300px]"><CardContent className="flex items-center justify-center"><Skeleton className="h-32 w-full"/></CardContent></Card>;
  if (!data?.bot || !data?.human) return null;

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Bot vs Human Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          
          {/* Bot Panel */}
          <div className="bg-bot-primary/5 border border-bot-primary/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-bot-primary font-semibold">
              <Bot className="h-5 w-5" /> AI Bot
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Handled</span>
                <span className="font-bold">{data.bot.handled}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Conv. Rate</span>
                <span className="font-bold">{data.bot.convRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/> Avg Response</span>
                <span className="font-bold">{data.bot.resTime}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Resolution</span>
                <span className="font-bold">{data.bot.resolutionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Human Panel */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <User className="h-5 w-5" /> Human Agents
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Handled</span>
                <span className="font-bold">{data.human.handled}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Conv. Rate</span>
                <span className="font-bold">{data.human.convRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/> Avg Response</span>
                <span className="font-bold">{data.human.resTime}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Resolution</span>
                <span className="font-bold">{data.human.resolutionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}