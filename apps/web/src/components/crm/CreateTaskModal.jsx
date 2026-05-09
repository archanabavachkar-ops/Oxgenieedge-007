
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { Calendar } from '@/components/ui/calendar.jsx';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

const CreateTaskModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);

  const [formData, setFormData] = useState({ title: '', description: '', lead_id: 'none', priority: 'medium', status: 'to_do', assigned_to: 'none', due_date: null, reminder_type: '1_hour_before' });

  useEffect(() => { if (open) fetchDropdownData(); }, [open]);

  const fetchDropdownData = async () => {
    try {
      const [usersRes, leadsRes] = await Promise.all([
        pb.collection('users').getFullList({ filter: 'role != "user"', $autoCancel: false }),
        pb.collection('leads').getFullList({ sort: '-created', $autoCancel: false })
      ]);
      setUsers(usersRes); setLeads(leadsRes);
    } catch (err) {}
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return toast.error("Task title is required");
    setLoading(true);
    try {
      const payload = { ...formData, due_date: formData.due_date ? formData.due_date.toISOString() : null, assigned_to: formData.assigned_to === 'none' ? null : formData.assigned_to, lead_id: formData.lead_id === 'none' ? null : formData.lead_id };
      const res = await apiServerClient.fetch('/tasks/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Task created successfully");
      onSuccess && onSuccess(); onOpenChange(false);
      setFormData({ title: '', description: '', lead_id: 'none', priority: 'medium', status: 'to_do', assigned_to: 'none', due_date: null, reminder_type: '1_hour_before' });
    } catch (err) { toast.error("Error creating task"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[24px] border-[#E2E8F0] shadow-premium-hover">
        <DialogHeader className="border-b border-[#E2E8F0] pb-4">
          <DialogTitle className="text-2xl font-heading font-bold text-[#0F172A]">Create New Task</DialogTitle>
          <DialogDescription className="font-medium text-[#64748B]">Add a new task to track follow-ups or administrative work.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Lead Association</Label>
              <Select value={formData.lead_id} onValueChange={v => setFormData({...formData, lead_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
                <SelectContent><SelectItem value="none">-- No Lead --</SelectItem>{leads.map(lead => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assign To</Label>
              <Select value={formData.assigned_to} onValueChange={v => setFormData({...formData, assigned_to: v})}>
                <SelectTrigger><SelectValue placeholder="Select Assignee" /></SelectTrigger>
                <SelectContent><SelectItem value="none">-- Unassigned --</SelectItem>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="to_do">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`w-full justify-start text-left font-semibold border-[#E2E8F0] ${!formData.due_date && 'text-[#94A3B8]'}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.due_date} onSelect={date => setFormData({...formData, due_date: date})} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#E2E8F0] pt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !formData.title.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
