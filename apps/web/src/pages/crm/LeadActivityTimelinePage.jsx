import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  ArrowLeft, Download, Plus, Search, Loader2, PhoneCall, Mail, MessageSquare, 
  MapPin, ListTodo, FileText, Activity 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const ACTIVITY_ICONS = {
  call: <PhoneCall className="w-5 h-5 text-indigo-500" />,
  email: <Mail className="w-5 h-5 text-sky-500" />,
  whatsapp: <MessageSquare className="w-5 h-5 text-emerald-500" />,
  sms: <MessageSquare className="w-5 h-5 text-blue-500" />,
  task: <ListTodo className="w-5 h-5 text-purple-500" />,
  note: <FileText className="w-5 h-5 text-amber-500" />,
  visit: <MapPin className="w-5 h-5 text-rose-500" />
};

const LeadActivityTimelinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadRecord, activityRecords] = await Promise.all([
        pb.collection('leads').getOne(id, { $autoCancel: false }).catch(() => null),
        pb.collection('activities').getFullList({
          filter: `lead_id = "${id}"`,
          sort: '-timestamp',
          expand: 'user_id',
          $autoCancel: false
        }).catch(() => [])
      ]);
      setLead(leadRecord);
      setActivities(activityRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CrmLayout title="Lead Timeline">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </CrmLayout>
    );
  }

  const filteredActivities = activities.filter(a => 
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.type.includes(searchTerm.toLowerCase())
  );

  return (
    <CrmLayout title={`Activity Timeline: ${lead?.name || 'Lead'}`}>
      <Helmet><title>Timeline - CRM</title></Helmet>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/crm/leads/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lead
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Note
          </Button>
        </div>
      </div>

      <Card className="card-shadow mb-6">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Filter timeline..." 
              className="pl-9 h-9 bg-card text-foreground"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-px before:bg-border">
            {filteredActivities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No activities recorded.</div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-6 group">
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-card bg-muted text-foreground shrink-0 shadow-sm z-10">
                    {ACTIVITY_ICONS[activity.type] || <Activity className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 bg-card p-4 rounded-xl border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm capitalize">{activity.type.replace('_', ' ')}</h4>
                      <time className="text-xs font-medium text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp || activity.created), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="text-sm text-foreground mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        By {activity.expand?.user_id?.name || activity.expand?.user_id?.email || 'System'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </CrmLayout>
  );
};

export default LeadActivityTimelinePage;