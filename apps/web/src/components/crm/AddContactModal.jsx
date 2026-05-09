
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useLeadAssignment } from '@/hooks/useLeadAssignment.js';

const AddContactModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { assignLead, isAssigning } = useLeadAssignment();
  const [createdLeadId, setCreatedLeadId] = useState(null);
  const [assignedAgent, setAssignedAgent] = useState(null);

  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', company: '', source: 'Direct', status: 'New Lead', priority: 'Medium' });

  const resetState = () => { setFormData({ name: '', email: '', mobile: '', company: '', source: 'Direct', status: 'New Lead', priority: 'Medium' }); setCreatedLeadId(null); setAssignedAgent(null); };
  const handleCloseComplete = () => { onSuccess(); onClose(); setTimeout(resetState, 300); };
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile) return toast.error('Required fields missing');
    setLoading(true);
    try {
      const record = await pb.collection('leads').create({ ...formData, nextFollowUpDate: new Date(Date.now() + 86400000).toISOString() }, { $autoCancel: false });
      toast.success('Lead created'); setCreatedLeadId(record.id);
    } catch (err) { toast.error('Failed to create'); } finally { setLoading(false); }
  };

  const handleAutoAssign = async () => {
    if (!createdLeadId) return;
    const result = await assignLead(createdLeadId);
    if (result.success) { setAssignedAgent(result.agentName); toast.success(`Assigned to ${result.agentName}`); setTimeout(handleCloseComplete, 2000); }
    else toast.error('Failed to assign');
  };

  if (createdLeadId) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseComplete()}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] border-[#E2E8F0] shadow-premium-hover">
          <DialogHeader><DialogTitle className="text-center text-2xl font-heading text-[#0F172A]">Lead Created</DialogTitle></DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
            {assignedAgent ? (
              <div className="text-[#22C55E] flex flex-col items-center animate-in zoom-in"><CheckCircle className="w-16 h-16 mb-4" /><p className="text-lg font-bold text-[#0F172A]">Assigned to {assignedAgent}</p></div>
            ) : (
              <div className="animate-in fade-in flex flex-col items-center">
                <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-[16px] flex items-center justify-center mb-4"><UserPlus className="w-8 h-8 text-[#FF6B00]" /></div>
                <p className="text-[#0F172A] font-bold mb-2">Auto-assign this lead?</p>
                <div className="flex gap-3 w-full mt-6"><Button variant="secondary" className="flex-1" onClick={handleCloseComplete} disabled={isAssigning}>Skip</Button><Button className="flex-1" onClick={handleAutoAssign} disabled={isAssigning}>{isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}Auto-Assign</Button></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[24px] border-[#E2E8F0] shadow-premium-hover overflow-hidden">
        <DialogHeader className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <DialogTitle className="text-2xl font-heading font-bold text-[#0F172A]">Add New Lead</DialogTitle>
          <DialogDescription className="font-medium text-[#64748B]">Create a new lead record in the CRM.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={(e) => handleChange('mobile', e.target.value)} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={formData.company} onChange={(e) => handleChange('company', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Source</Label><Select value={formData.source} onValueChange={(val) => handleChange('source', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Website">Website</SelectItem><SelectItem value="Direct">Direct</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(val) => handleChange('status', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="New Lead">New Lead</SelectItem><SelectItem value="Qualified">Qualified</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Priority</Label><Select value={formData.priority} onValueChange={(val) => handleChange('priority', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Hot">Hot</SelectItem><SelectItem value="Medium">Medium</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter className="pt-4 mt-2 border-t border-[#E2E8F0]">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Create Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
