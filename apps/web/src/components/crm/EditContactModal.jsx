
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const EditContactModal = ({ isOpen, onClose, onSuccess, contact }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', company: '', source: 'Direct', status: 'Lead' });

  useEffect(() => {
    if (contact) setFormData({ name: contact.name || '', email: contact.email || '', mobile: contact.mobile || '', company: contact._company || '', source: contact._source || 'Direct', status: contact._status || 'Lead' });
  }, [contact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Name and Email required');
    setLoading(true);
    try {
      await pb.collection('contacts').update(contact.id, { ...formData, message: JSON.stringify({ company: formData.company, source: formData.source, status: formData.status }) }, { $autoCancel: false });
      toast.success('Updated'); onSuccess(); onClose();
    } catch (err) { toast.error('Failed to update'); } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[24px] border-[#E2E8F0] shadow-premium-hover overflow-hidden">
        <DialogHeader className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <DialogTitle className="text-2xl font-heading font-bold text-[#0F172A]">Edit Contact</DialogTitle>
          <DialogDescription className="font-medium text-[#64748B]">Update contact information.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={(e) => setFormData(p => ({...p, mobile: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={formData.company} onChange={(e) => setFormData(p => ({...p, company: e.target.value}))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Source</Label><Select value={formData.source} onValueChange={(v) => setFormData(p => ({...p, source: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Website">Website</SelectItem><SelectItem value="Direct">Direct</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Lead">Lead</SelectItem><SelectItem value="Customer">Customer</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter className="pt-4 mt-2 border-t border-[#E2E8F0] flex justify-between w-full">
            <Button type="button" variant="ghost" className="text-[#EF4444] hover:bg-[#EF4444]/10"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
            <div className="flex gap-2"><Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save</Button></div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactModal;
