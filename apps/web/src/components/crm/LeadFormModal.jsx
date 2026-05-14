import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Loader2 } from 'lucide-react';

const SOURCE_OPTIONS = ['Website', 'Phone Call', 'Email', 'Referral', 'Social Media', 'Trade Show', 'Other'];
const STATUS_OPTIONS = [{ value: 'new', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' }];
const PRIORITY_OPTIONS = ['Hot', 'Medium', 'Cold'];

export default function LeadFormModal({ isOpen, onClose, lead, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company: '',
    status: 'new',
    priority: 'Medium',
    source: 'Website',
  });

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        mobile: lead.mobile || '',
        company: lead.company || '',
        status: lead.status || 'new',
        priority: lead.priority || 'Medium',
        source: lead.source || 'Website',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        email: '',
        mobile: '',
        company: '',
        status: 'new',
        priority: 'Medium',
        source: 'Website',
      });
    }
  }, [lead, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile || !formData.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (lead?.id) {
        await pb.collection('leads').update(lead.id, formData, { $autoCancel: false });
        toast.success('Lead updated successfully');
      } else {
        // Handle nextFollowUpDate as required by schema (set to tomorrow)
        const nextFollowUp = new Date();
        nextFollowUp.setDate(nextFollowUp.getDate() + 1);
        
        await pb.collection('leads').create({
          ...formData,
          nextFollowUpDate: nextFollowUp.toISOString(),
        }, { $autoCancel: false });
        toast.success('Lead created successfully');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(error.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Update the details for this lead.' : 'Enter the details to create a new lead in the CRM.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={formData.company} 
                onChange={(e) => handleChange('company', e.target.value)} 
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => handleChange('email', e.target.value)} 
                placeholder="jane@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Phone Number <span className="text-destructive">*</span></Label>
              <Input 
                id="mobile" 
                value={formData.mobile} 
                onChange={(e) => handleChange('mobile', e.target.value)} 
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Lead Source <span className="text-destructive">*</span></Label>
            <Select value={formData.source} onValueChange={(val) => handleChange('source', val)}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map(src => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => handleChange('priority', val)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(pr => (
                    <SelectItem key={pr} value={pr}>{pr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                lead ? 'Save Changes' : 'Create Lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}