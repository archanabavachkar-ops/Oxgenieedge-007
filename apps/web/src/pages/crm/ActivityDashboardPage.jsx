import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  PhoneCall, Mail, MessageSquare, MapPin, ListTodo, FileText, Download, Filter, Search, Activity, Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const ACTIVITY_ICONS = {
  call: <PhoneCall className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-emerald-500" />,
  sms: <MessageSquare className="w-4 h-4 text-blue-500" />,
  task: <ListTodo className="w-4 h-4 text-purple-500" />,
  note: <FileText className="w-4 h-4 text-amber-500" />,
  visit: <MapPin className="w-4 h-4 text-rose-500" />
};

const ActivityDashboardPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('activities').getList(1, 50, {
        sort: '-timestamp',
        expand: 'lead_id,user_id',
        $autoCancel: false
      });
      setActivities(records.items);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Direct call to export endpoint
      const res = await apiServerClient.fetch('/activities/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' })
      });
      
      if (!res.ok) throw new Error("Export failed");
      
      // Handle file download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const filteredActivities = activities.filter(a => 
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.expand?.lead_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CrmLayout title="Activity Logs">
      <Helmet><title>Activities - CRM Dashboard</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-muted-foreground text-balance max-w-2xl">
          Comprehensive audit trail of all team interactions, tasks, and system events.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button onClick={handleExport} disabled={exporting} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="card-shadow">
            <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Timeline
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search activities..." 
                  className="pl-9 h-8 bg-card"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filteredActivities.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No activities found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        {ACTIVITY_ICONS[activity.type] || <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.description || `Performed a ${activity.type} action`}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.timestamp || activity.created), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {activity.expand?.user_id && (
                            <span className="font-medium text-primary">By: {activity.expand.user_id.name || activity.expand.user_id.email}</span>
                          )}
                          {activity.expand?.lead_id && (
                            <span>Lead: <span className="font-medium text-foreground">{activity.expand.lead_id.name}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <Card className="card-shadow">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total (30 days)</span>
                <span className="font-bold text-foreground">1,284</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Emails Sent</span>
                <span className="font-bold text-foreground">452</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Calls Made</span>
                <span className="font-bold text-foreground">210</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="font-bold text-foreground">348</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default ActivityDashboardPage;