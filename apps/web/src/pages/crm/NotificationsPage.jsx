import React from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Bell, Mail, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const NotificationsPage = () => {
  return (
    <CrmLayout title="Email Notifications">
      <Helmet><title>Notifications - CRM</title></Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Broadcasts</h3>
          
          <Card className="shadow-sm border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Mail className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-semibold text-foreground">New Lead Alert: High Value</h4>
                    <p className="text-sm text-muted-foreground">Sent to sales@oxgenieedge.com</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Delivered</Badge>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm font-mono text-muted-foreground border border-border">
                Subject: 🚀 HOT LEAD: score 92 from Direct Search...
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Opened 2 mins ago
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Bell className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Pipeline Stagnation Warning</h4>
                    <p className="text-sm text-muted-foreground">Sent to manager@oxgenieedge.com</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Delivered</Badge>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm font-mono text-muted-foreground border border-border">
                Subject: Action Required: 12 leads stuck in Proposal stage...
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-6">Preferences</h3>
          <Card className="shadow-sm border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" /> Alert Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">New Leads</p>
                  <p className="text-xs text-muted-foreground">Notify on every capture</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Hot Leads (Score {'>'} 80)</p>
                  <p className="text-xs text-muted-foreground">Priority alerts</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Daily Digest</p>
                  <p className="text-xs text-muted-foreground">Morning summary email</p>
                </div>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div></div>
              </div>

              <Button className="w-full mt-4" variant="outline">Save Preferences</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default NotificationsPage;