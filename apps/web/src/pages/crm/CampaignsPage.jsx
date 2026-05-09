import React from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Play, Plus, Settings2, Users, ArrowRight, Zap, Mail, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';

const CampaignsPage = () => {
  return (
    <CrmLayout title="Campaign Builder">
      <Helmet><title>Campaigns - CRM</title></Helmet>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Design multi-channel automation workflows.</p>
        <Button><Plus className="w-4 h-4 mr-2" /> New Workflow</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar templates/active */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Active Workflows</h3>
          <Card className="hover:border-primary/50 cursor-pointer transition-colors border-primary ring-1 ring-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-foreground">Welcome Sequence</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Triggers on: New Lead created</p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3"/> 1.2k enrolled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 cursor-pointer transition-colors opacity-70">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-foreground">Abandoned Form</span>
                <Badge variant="outline">Paused</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Triggers on: Form drop-off</p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Builder Canvas */}
        <Card className="lg:col-span-3 bg-slate-50/50 dark:bg-muted/10 min-h-[600px] border-dashed border-2 relative overflow-hidden">
          <CardContent className="p-8 h-full flex flex-col items-center">
            
            {/* Trigger Node */}
            <div className="bg-white dark:bg-card border border-primary/30 shadow-sm rounded-xl p-4 w-72 z-10 relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap className="w-4 h-4" /></div>
                <h4 className="font-semibold text-sm">Trigger</h4>
              </div>
              <p className="text-sm text-foreground">When <span className="font-semibold">New Lead</span> is created from Website.</p>
            </div>

            {/* Connection Line */}
            <div className="w-0.5 h-12 bg-slate-300 dark:bg-slate-700 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-border">
                <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90" />
              </div>
            </div>

            {/* Action Node 1 */}
            <div className="bg-white dark:bg-card border border-border shadow-sm rounded-xl p-4 w-72 z-10 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><MessageSquare className="w-4 h-4" /></div>
                  <h4 className="font-semibold text-sm">Send WhatsApp</h4>
                </div>
                <Settings2 className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </div>
              <div className="bg-muted rounded p-2 text-xs font-mono text-muted-foreground mt-2 border border-border/50">
                Hi {'{{name}}'}, thanks for your interest...
              </div>
            </div>

            {/* Connection Line with Delay */}
            <div className="w-0.5 h-16 bg-slate-300 dark:bg-slate-700 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-card text-xs px-2 py-1 rounded-full border border-border font-medium shadow-sm whitespace-nowrap text-muted-foreground">
                Wait 2 days
              </div>
            </div>

            {/* Condition Split */}
            <div className="bg-white dark:bg-card border border-amber-200 shadow-sm rounded-xl p-3 w-72 z-10 relative text-center">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Condition</span>
              <p className="text-sm mt-1">Did lead reply?</p>
            </div>

            <div className="flex w-96 justify-between mt-4 relative">
              {/* Fake horizontal split lines */}
              <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-slate-300 dark:bg-slate-700"></div>
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 ml-[20%]"></div>
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 mr-[20%]"></div>
            </div>

            <div className="flex w-[500px] justify-between">
              {/* Yes Path */}
              <div className="bg-white dark:bg-card border border-border shadow-sm rounded-xl p-4 w-56 z-10">
                <Badge className="mb-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Yes</Badge>
                <div className="flex items-center gap-2 mt-2">
                  <Play className="w-4 h-4 text-primary" /> <span className="text-sm">Move to Pipeline</span>
                </div>
              </div>
              
              {/* No Path */}
              <div className="bg-white dark:bg-card border border-border shadow-sm rounded-xl p-4 w-56 z-10">
                <Badge variant="outline" className="mb-2">No</Badge>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-blue-500" /> <span className="text-sm">Send Nurture Email</span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </CrmLayout>
  );
};

export default CampaignsPage;