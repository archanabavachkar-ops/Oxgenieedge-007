
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Phone, Calendar, User, Briefcase, Activity, Edit2, Save, X } from 'lucide-react';
import { fetchLeadDetailsWithActivity, updateLeadStatus, assignLeadToTeamMember } from '@/api/adminApi';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const LeadDetailsModal = ({ leadId, isOpen, onClose, onUpdate }) => {
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    description: '',
    status: '',
    assignedTo: ''
  });

  const statuses = [
    'New Lead', 'Attempted Contact', 'Connected', 'Qualified', 
    'Follow-up Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'
  ];

  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadDetails();
      loadUsers();
    } else {
      setIsEditing(false);
    }
  }, [isOpen, leadId]);

  const loadUsers = async () => {
    try {
      const records = await pb.collection('users').getFullList({ $autoCancel: false });
      setUsers(records);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const loadLeadDetails = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeadDetailsWithActivity(leadId);
      setLead(data);
      setActivities(data.activities || []);
      setEditForm({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        description: data.description || '',
        status: data.status || '',
        assignedTo: data.assignedTo || ''
      });
    } catch (error) {
      toast.error('Failed to load lead details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await pb.collection('leads').update(leadId, {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        description: editForm.description,
        status: editForm.status,
        assignedTo: editForm.assignedTo
      }, { $autoCancel: false });
      
      toast.success('Lead updated successfully');
      setIsEditing(false);
      loadLeadDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (isEditing) {
      setEditForm(prev => ({ ...prev, status: newStatus }));
      return;
    }
    
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success('Status updated');
      setLead(prev => ({ ...prev, status: newStatus }));
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignChange = async (newUserId) => {
    if (isEditing) {
      setEditForm(prev => ({ ...prev, assignedTo: newUserId === 'unassigned' ? '' : newUserId }));
      return;
    }

    try {
      const userId = newUserId === 'unassigned' ? '' : newUserId;
      await assignLeadToTeamMember(leadId, userId);
      toast.success('Assignment updated');
      loadLeadDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update assignment');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto sm:border-l sm:border-border">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lead ? (
          <div className="flex flex-col h-full gap-6 pb-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                    {isEditing ? (
                      <Input 
                        value={editForm.name} 
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg font-bold h-10 w-64 text-foreground"
                      />
                    ) : (
                      lead.name || 'Unnamed Lead'
                    )}
                  </SheetTitle>
                  <SheetDescription className="mt-1">
                    Source: <span className="font-medium text-foreground">{lead.source || 'Unknown'}</span> • Created {new Date(lead.created).toLocaleDateString()}
                  </SheetDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                ) : null}
              </div>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={isEditing ? editForm.status : lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</label>
                <Select 
                  value={isEditing ? (editForm.assignedTo || 'unassigned') : (lead.assignedTo || 'unassigned')} 
                  onValueChange={handleAssignChange}
                >
                  <SelectTrigger className="w-full">
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
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4" /> Contact Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </div>
                  {isEditing ? (
                    <Input 
                      type="email"
                      value={editForm.email} 
                      onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9 text-foreground"
                    />
                  ) : (
                    <div className="font-medium truncate">{lead.email || '—'}</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </div>
                  {isEditing ? (
                    <Input 
                      value={editForm.mobile} 
                      onChange={e => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                      className="h-9 text-foreground"
                    />
                  ) : (
                    <div className="font-medium">{lead.mobile || '—'}</div>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" /> Notes / Description
                </div>
                {isEditing ? (
                  <Textarea 
                    value={editForm.description} 
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px] resize-none mt-1 text-foreground"
                    placeholder="Add notes about this lead..."
                  />
                ) : (
                  <div className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap mt-1">
                    {lead.description || lead.message || 'No additional notes provided.'}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <SheetFooter className="flex flex-row justify-end gap-2 sm:justify-end border-t border-border pt-4 mt-2">
                <Button variant="ghost" onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: lead.name || '',
                    email: lead.email || '',
                    mobile: lead.mobile || '',
                    description: lead.description || '',
                    status: lead.status || '',
                    assignedTo: lead.assignedTo || ''
                  });
                }} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </SheetFooter>
            )}

            {!isEditing && (
              <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm flex-1">
                <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
                  <Activity className="h-4 w-4" /> Activity History
                </h3>
                
                <div className="space-y-4 pt-2">
                  {activities.length > 0 ? (
                    <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
                      {activities.map((activity, i) => (
                        <div key={activity.id || i} className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 ring-4 ring-card"></div>
                          <div className="text-sm font-medium">{activity.type?.replace(/_/g, ' ') || 'Interaction'}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.created).toLocaleString()}
                          </div>
                          {activity.details?.note && (
                            <div className="text-sm mt-2 bg-muted p-2 rounded-md">
                              {activity.details.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No activity history found for this lead.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailsModal;
