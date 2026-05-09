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

const TemplateEditor = ({ isOpen, onClose, template, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'email',
    category: 'general',
    content: '',
    is_active: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        channel: template.channel || 'email',
        category: template.category || 'general',
        content: template.content || '',
        is_active: template.is_active !== false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        channel: 'email',
        category: 'general',
        content: '',
        is_active: true,
      });
    }
  }, [template, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const orgId = pb.authStore.model?.organization_id || 'default_org';
      const payload = { ...formData, organization_id: orgId };

      if (template?.id) {
        try {
          await apiServerClient.fetch(`/templates/${template.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          await pb.collection('message_templates').update(template.id, payload, { $autoCancel: false });
        }
        toast.success('Template updated successfully');
      } else {
        try {
          await apiServerClient.fetch('/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          await pb.collection('message_templates').create(payload, { $autoCancel: false });
        }
        toast.success('Template created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g., Welcome Email"
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
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <Label htmlFor="is_active" className="mb-2">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => handleChange('is_active', v)} 
                />
                <span className="text-sm text-muted-foreground">{formData.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Brief description of when to use this template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              value={formData.content} 
              onChange={(e) => handleChange('content', e.target.value)} 
              placeholder="Hello {{name}}, welcome to our service!"
              className="min-h-[150px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {'{{variable_name}}'} for dynamic content placeholders.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;