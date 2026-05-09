import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const AutoReplyEditor = ({ isOpen, onClose, rule, templates, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'email',
    trigger_type: 'keyword',
    template_id: 'none',
    custom_message: '',
    priority: 10,
    is_active: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        channel: rule.channel || 'email',
        trigger_type: rule.trigger_type || 'keyword',
        template_id: rule.template_id || 'none',
        custom_message: rule.custom_message || '',
        priority: rule.priority || 10,
        is_active: rule.is_active !== false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        channel: 'email',
        trigger_type: 'keyword',
        template_id: 'none',
        custom_message: '',
        priority: 10,
        is_active: true,
      });
    }
  }, [rule, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    if (formData.template_id === 'none' && !formData.custom_message) {
      toast.error('Either select a template or provide a custom message');
      return;
    }

    setIsLoading(true);
    try {
      const orgId = pb.authStore.model?.organization_id || 'default_org';
      const payload = { 
        ...formData, 
        organization_id: orgId,
        template_id: formData.template_id === 'none' ? null : formData.template_id
      };

      if (rule?.id) {
        try {
          await apiServerClient.fetch(`/auto-reply/${rule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          await pb.collection('auto_reply_rules').update(rule.id, payload, { $autoCancel: false });
        }
        toast.success('Rule updated successfully');
      } else {
        try {
          await apiServerClient.fetch('/auto-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          await pb.collection('auto_reply_rules').create(payload, { $autoCancel: false });
        }
        toast.success('Rule created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.channel === formData.channel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Auto-Reply Rule' : 'Create Auto-Reply Rule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g., Out of Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={formData.channel} onValueChange={(v) => handleChange('channel', v)}>
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="chat">Live Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trigger_type">Trigger Type</Label>
              <Select value={formData.trigger_type} onValueChange={(v) => handleChange('trigger_type', v)}>
                <SelectTrigger id="trigger_type">
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword Match</SelectItem>
                  <SelectItem value="time_based">Time Based (Outside Hours)</SelectItem>
                  <SelectItem value="status_based">Status Based</SelectItem>
                  <SelectItem value="agent_unavailable">Agent Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (Lower = Higher Priority)</Label>
              <Input 
                id="priority" 
                type="number"
                value={formData.priority} 
                onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Brief description of this rule"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">Response Template</Label>
            <Select value={formData.template_id} onValueChange={(v) => handleChange('template_id', v)}>
              <SelectTrigger id="template_id">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Use Custom Message --</SelectItem>
                {filteredTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.template_id === 'none' && (
            <div className="space-y-2">
              <Label htmlFor="custom_message">Custom Message</Label>
              <Textarea 
                id="custom_message" 
                value={formData.custom_message} 
                onChange={(e) => handleChange('custom_message', e.target.value)} 
                placeholder="Enter the auto-reply message..."
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={(v) => handleChange('is_active', v)} 
            />
            <Label htmlFor="is_active">Rule is active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoReplyEditor;