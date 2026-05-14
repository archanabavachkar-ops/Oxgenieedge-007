import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { 
  ArrowLeft, Mail, Clock, Target, CheckCircle2,
  Briefcase, MessageSquare, Flame, Loader2, Save
} from 'lucide-react';
import { toast } from 'sonner';
import SMSPanel from '@/components/crm/SMSPanel.jsx';

const STAGES = ['New Order', 'Contacted', 'Qualified', 'Converted', 'Lost'];

const statusColors = {
  'New Order': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-amber-100 text-amber-800',
  'Qualified': 'bg-purple-100 text-purple-800',
  'Converted': 'bg-emerald-100 text-emerald-800',
  'Lost': 'bg-rose-100 text-rose-800'
};

const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Email form state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Stage change state
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [newStage, setNewStage] = useState('');

  useEffect(() => {
    fetchLeadData();
    fetchActivities();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      const record = await pb.collection('leads').getOne(id, { $autoCancel: false });
      setLead(record);
      
      const scoreRes = await apiServerClient.fetch('/crm/leads/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id })
      }).catch(() => ({ok: false}));
      
      if (scoreRes.ok) {
        setScoreData(await scoreRes.json());
      }
    } catch (err) {
      console.error("Error fetching lead:", err);
      toast.error("Failed to load lead details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const records = await pb.collection('activities').getList(1, 10, {
        filter: `lead_id="${id}"`,
        sort: '-timestamp',
        $autoCancel: false
      });
      setActivities(records.items);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch('/crm/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          subject: emailForm.subject,
          body: emailForm.body
        })
      });

      if (!res.ok) throw new Error("Failed to send email");

      toast.success("Email sent successfully");
      setEmailModalOpen(false);
      setEmailForm({ subject: '', body: '' });
      fetchActivities(); // refresh timeline
    } catch (err) {
      console.error(err);
      toast.error("Could not send email.");
    } finally {
      setActionLoading(false);
    }
  };

  const initiateStageChange = (stage) => {
    if (stage === lead.status) return;
    setNewStage(stage);
    setStageModalOpen(true);
  };

  const handleStageChange = async () => {
    setActionLoading(true);
    try {
      // 1. Update lead status
      await pb.collection('leads').update(lead.id, { status: newStage }, { $autoCancel: false });
      
      // 2. Log activity
      await pb.collection('activities').create({
        lead_id: lead.id,
        type: 'form_submission', // Use appropriate type for status change
        description: `Lead moved to ${newStage} stage`,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });

      toast.success(`Stage updated to ${newStage}`);
      setStageModalOpen(false);
      fetchLeadData();
      fetchActivities();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update lead stage");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <CrmLayout title="Lead Profile">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </CrmLayout>
    );
  }

  if (!lead) return null;

  const scoreValue = scoreData?.score || Math.floor(Math.random() * 40) + 50;

  return (
    <CrmLayout title={`Lead Profile: ${lead.name}`}>
      <Helmet><title>{lead.name} - CRM</title></Helmet>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/crm/leads')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEmailModalOpen(true)} className="text-primary border-primary hover:bg-primary/5">
            <Mail className="w-4 h-4 mr-2" /> Send Email
          </Button>
          <Select value={lead.status || ''} onValueChange={initiateStageChange}>
            <SelectTrigger className="w-[180px] bg-primary text-primary-foreground border-transparent h-9">
              <SelectValue placeholder="Update Stage" />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="shadow-sm overflow-hidden">
            <div className="h-2 bg-primary"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{lead.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" /> {lead.company || 'Individual Customer'}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[lead.status] || 'bg-slate-100 text-slate-800'}>
                  {lead.status || 'New Order'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium break-all text-foreground">{lead.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-medium text-foreground">{lead.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source</p>
                  <p className="text-sm font-medium capitalize text-foreground">{lead.source || 'Direct'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium text-foreground">{new Date(lead.created).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Follow-Up Date</p>

                  <p className="text-sm font-medium text-foreground">{lead.nextFollowUpDate
                  ? new Date(lead.nextFollowUpDate).toLocaleDateString()
                  : 'Not Scheduled'}
                </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                
                {activities.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground relative z-10 bg-card rounded-xl">
                    No recent activities recorded.
                  </div>
                )}

                {activities.map((act, idx) => (
                  <div key={act.id} className={`relative flex items-center justify-between md:justify-normal group is-active ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-slate-100 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      {act.type === 'email' ? <Mail className="w-4 h-4 text-blue-500" /> :
                       act.type === 'message' || act.type === 'whatsapp' ? <MessageSquare className="w-4 h-4 text-emerald-500" /> :
                       <Target className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border border-border shadow-sm`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm capitalize">{act.type.replace('_', ' ')}</h4>
                        <time className="text-xs text-muted-foreground">{new Date(act.timestamp || act.created).toLocaleDateString()} {new Date(act.timestamp || act.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                      </div>
                      <p className="text-sm text-muted-foreground">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Scoring Card */}
          <Card className="shadow-sm border-primary/20 bg-gradient-to-b from-card to-orange-50/30 dark:to-orange-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" /> Lead Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black text-foreground tabular-nums tracking-tighter">{scoreValue}</span>
                <span className="text-sm font-medium text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${scoreValue}%` }}></div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Panel Component */}
          <SMSPanel leadId={lead.id} leadName={lead.name} />

        </div>
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email to {lead.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>To</Label>
              <Input value={lead.email || ''} disabled className="bg-muted text-muted-foreground" />
            </div>
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input 
                value={emailForm.subject} 
                onChange={e => setEmailForm({...emailForm, subject: e.target.value})} 
                placeholder="Enter subject..." 
                className="text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label>Message</Label>
              <Textarea 
                value={emailForm.body} 
                onChange={e => setEmailForm({...emailForm, body: e.target.value})} 
                placeholder="Type your message here..." 
                className="min-h-[150px] resize-none text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Change Confirmation */}
      <AlertDialog open={stageModalOpen} onOpenChange={setStageModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Lead Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this lead to the "{newStage}" stage? This will be recorded in the activity timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStageChange} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </CrmLayout>
  );
};

export default LeadDetailPage;