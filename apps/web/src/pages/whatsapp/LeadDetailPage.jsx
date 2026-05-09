import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { formatPhoneNumber, formatTimestamp } from '@/utils/WhatsAppUtils.js';
import { ArrowLeft, Trash2, Archive, Phone, Mail, User, Save, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadDetailPage() {
  const { id } = useParams(); // URL encoded phone number
  const navigate = useNavigate();
  const phone = decodeURIComponent(id);
  
  const [messages, setMessages] = useState([]);
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);

  // Editable fields
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    status: '',
    assignedTo: '',
    notes: ''
  });

  const fetchThread = async () => {
    try {
      // 1. Fetch incoming webhook logs for this phone
      const incoming = await pb.collection('whatsapp_webhook_logs').getFullList({
        filter: `from_number = "${phone}"`,
        sort: 'created',
        $autoCancel: false
      });
      
      // We assume outgoing messages might be in whatsapp_messages or we just show incoming for now
      // Since whatsapp_messages has lead_id not phone directly, we need the lead first.
      
      // 2. Fetch lead
      const existingLeads = await pb.collection('leads').getFullList({
        filter: `mobile = "${phone}"`,
        $autoCancel: false
      });

      let outgoing = [];
      let currentLead = null;

      if (existingLeads.length > 0) {
        currentLead = existingLeads[0];
        setLead(currentLead);
        setEditData({
          name: currentLead.name || '',
          email: currentLead.email || '',
          status: currentLead.status || 'New Lead',
          assignedTo: currentLead.assignedTo || '',
          notes: currentLead.notes || ''
        });

        // Try to fetch outgoing from whatsapp_messages if they exist
        try {
          outgoing = await pb.collection('whatsapp_messages').getFullList({
            filter: `lead_id = "${currentLead.id}"`,
            sort: 'created',
            $autoCancel: false
          });
        } catch(e) { /* ignore if collection empty or restricted */ }
      }

      // Combine and sort
      const merged = [
        ...incoming.map(m => ({ ...m, _type: 'incoming', date: new Date(m.created) })),
        ...outgoing.map(m => ({ ...m, _type: 'outgoing', date: new Date(m.created), message_text: m.message }))
      ].sort((a, b) => a.date - b.date);

      setMessages(merged);

      // Fetch users for assignment
      const allUsers = await pb.collection('users').getFullList({ $autoCancel: false });
      setUsers(allUsers);

    } catch (err) {
      toast.error('Failed to load conversation: ' + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }
  };

  useEffect(() => {
    fetchThread();

    // Setup real-time listener for incoming messages to this phone
    pb.collection('whatsapp_webhook_logs').subscribe('*', (e) => {
      if (e.action === 'create' && e.record.from_number === phone) {
        setMessages(prev => [...prev, { ...e.record, _type: 'incoming', date: new Date(e.record.created) }]);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
      }
    });

    return () => {
      pb.collection('whatsapp_webhook_logs').unsubscribe('*');
    };
  }, [phone]);

  const handleSaveLead = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const updated = await pb.collection('leads').update(lead.id, {
        name: editData.name,
        email: editData.email,
        status: editData.status,
        assignedTo: editData.assignedTo,
        notes: editData.notes
      }, { $autoCancel: false });
      setLead(updated);
      toast.success('Lead details saved');
    } catch (error) {
      toast.error('Failed to save lead: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBlurSave = () => {
    // Only save if data actually changed to prevent spam
    if (lead && (
      lead.name !== editData.name ||
      lead.email !== editData.email ||
      lead.notes !== editData.notes
    )) {
      handleSaveLead();
    }
  };

  const STATUS_COLORS = {
    'New Lead': 'bg-blue-500',
    'Attempted Contact': 'bg-yellow-500',
    'Connected': 'bg-emerald-500',
    'Qualified': 'bg-green-500',
    'Won': 'bg-purple-500',
    'Lost': 'bg-gray-500',
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center h-full"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/whatsapp-leads')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {editData.name || formatPhoneNumber(phone)}
              {lead && <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[editData.status] || 'bg-gray-500'}`} title={editData.status} />}
            </h2>
            <p className="text-sm text-muted-foreground">{formatPhoneNumber(phone)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead && (
            <>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => toast.info('Archiving feature coming soon')}>
                <Archive className="w-4 h-4 mr-2" /> Archive
              </Button>
              <Button size="sm" onClick={handleSaveLead} disabled={saving}>
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden mt-4 gap-6">
        {/* Chat Thread */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-border bg-[#efeae2] dark:bg-[#0b141a]">
          <CardHeader className="py-3 px-4 border-b border-border bg-card shrink-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#25D366]" /> Conversation Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No messages found.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isIncoming = msg._type === 'incoming';
                return (
                  <div key={msg.id || idx} className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 shadow-sm relative ${
                      isIncoming 
                        ? 'bg-card text-card-foreground rounded-tl-none' 
                        : 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.message_text || <span className="italic opacity-70">Media attachment</span>}
                      </p>
                      <p className={`text-[10px] mt-1 text-right ${isIncoming ? 'text-muted-foreground' : 'text-black/50 dark:text-white/50'}`}>
                        {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(msg.date)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <div className="p-3 bg-card border-t border-border shrink-0">
             <p className="text-xs text-muted-foreground text-center">Replies to WhatsApp messages must be sent within the 24-hour service window via the official app or integration provider.</p>
          </div>
        </Card>

        {/* Lead Details Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-8">
          {!lead ? (
             <Card className="shadow-sm">
               <CardContent className="p-6 text-center">
                 <p className="text-muted-foreground mb-4">This number is not linked to a lead.</p>
                 <Button className="w-full" onClick={() => toast.error('Creation without auto-hook disabled for now.')}>
                   Create Lead
                 </Button>
               </CardContent>
             </Card>
          ) : (
            <>
              <Card className="shadow-sm border-border">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-base">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><User className="w-3 h-3"/> Name</label>
                    <Input 
                      value={editData.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      onBlur={handleBlurSave}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</label>
                    <Input value={phone} readOnly className="h-8 text-sm bg-muted" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Mail className="w-3 h-3"/> Email</label>
                    <Input 
                      value={editData.email} 
                      onChange={e => setEditData({...editData, email: e.target.value})}
                      onBlur={handleBlurSave}
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-base">Management</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">Status</label>
                    <Select 
                      value={editData.status} 
                      onValueChange={val => {
                        setEditData({...editData, status: val});
                        // Immediate save for dropdowns
                        pb.collection('leads').update(lead.id, { status: val }, { $autoCancel: false }).then(()=>toast.success('Status updated'));
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Lead">New Lead</SelectItem>
                        <SelectItem value="Attempted Contact">Attempted Contact</SelectItem>
                        <SelectItem value="Connected">Connected</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Won">Won</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">Assigned To</label>
                    <Select 
                      value={editData.assignedTo || "unassigned"} 
                      onValueChange={val => {
                        const newAssignee = val === 'unassigned' ? '' : val;
                        setEditData({...editData, assignedTo: newAssignee});
                        pb.collection('leads').update(lead.id, { assignedTo: newAssignee }, { $autoCancel: false }).then(()=>toast.success('Assignment updated'));
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border flex-1 flex flex-col min-h-[200px]">
                <CardHeader className="pb-3 border-b border-border/50 shrink-0">
                  <CardTitle className="text-base">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  <Textarea 
                    value={editData.notes}
                    onChange={e => setEditData({...editData, notes: e.target.value})}
                    onBlur={handleBlurSave}
                    className="flex-1 border-0 focus-visible:ring-0 rounded-none resize-none p-4 text-sm"
                    placeholder="Add notes about this conversation..."
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}