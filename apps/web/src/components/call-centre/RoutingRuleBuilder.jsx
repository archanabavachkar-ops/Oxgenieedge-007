import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const RoutingRuleBuilder = ({ isOpen, onClose, rule, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    priority: 10,
    is_active: true,
    conditions: {
      language: '',
      lead_source: '',
      customer_segment: '',
      time_of_day: ''
    },
    target_agent_id: '',
    target_queue: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (rule) {
        setFormData({
          name: rule.name || '',
          priority: rule.priority || 10,
          is_active: rule.is_active ?? true,
          conditions: rule.conditions || { language: '', lead_source: '', customer_segment: '', time_of_day: '' },
          target_agent_id: rule.target_agent_id || '',
          target_queue: rule.target_queue || ''
        });
      } else {
        setFormData({
          name: '',
          priority: 10,
          is_active: true,
          conditions: { language: '', lead_source: '', customer_segment: '', time_of_day: '' },
          target_agent_id: '',
          target_queue: ''
        });
      }
    }
  }, [isOpen, rule]);

  const handleConditionChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: { ...prev.conditions, [key]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (!formData.target_agent_id && !formData.target_queue) {
      toast.error('A target agent or queue must be specified');
      return;
    }

    setLoading(true);
    try {
      const url = rule ? `/routing/rules/${rule.id}` : '/routing/rules';
      const method = rule ? 'PUT' : 'POST';
      
      // Clean up empty conditions before sending
      const cleanedConditions = {};
      Object.entries(formData.conditions).forEach(([k, v]) => {
        if (v && v.trim() !== '') cleanedConditions[k] = v;
      });

      const payload = {
        ...formData,
        conditions: cleanedConditions,
        priority: Number(formData.priority)
      };

      const response = await apiServerClient.fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save routing rule');
      }
      
      toast.success(rule ? 'Rule updated successfully' : 'Rule created successfully');
      onSave(data.rule || data);
      onClose();
    } catch (error) {
      console.error('Error saving routing rule:', error);
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleTestRoute = async () => {
    setTesting(true);
    try {
      const response = await apiServerClient.fetch('/routing/find-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'test_cust_001',
          language: formData.conditions.language || 'en',
          strategy: 'least_busy'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Test failed');
      
      toast.success(`Agent found: ${data.agent?.id || 'Unknown'}`);
    } catch (error) {
      toast.error(`Routing test: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Routing Rule' : 'Create Routing Rule'}</DialogTitle>
          <DialogDescription>Define logic to automatically route inbound calls to the right agent or queue.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* General */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. VIP Customer Routing" 
              />
            </div>
            <div className="space-y-2">
              <Label>Priority (1-100) *</Label>
              <Input 
                type="number" 
                min="1" 
                max="100" 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})} 
              />
              <p className="text-[10px] text-muted-foreground">Lower number = higher priority</p>
            </div>
          </div>

          {/* Conditions */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Matching Conditions</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={formData.conditions.language || "any"} 
                    onValueChange={(val) => handleConditionChange('language', val === 'any' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Language</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Customer Segment</Label>
                  <Select 
                    value={formData.conditions.customer_segment || "any"} 
                    onValueChange={(val) => handleConditionChange('customer_segment', val === 'any' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Segment</SelectItem>
                      <SelectItem value="vip">VIP / Enterprise</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="new">New Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Input 
                    value={formData.conditions.lead_source} 
                    onChange={(e) => handleConditionChange('lead_source', e.target.value)} 
                    placeholder="e.g. facebook_ads" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time of Day (UTC)</Label>
                  <Input 
                    value={formData.conditions.time_of_day} 
                    onChange={(e) => handleConditionChange('time_of_day', e.target.value)} 
                    placeholder="e.g. 09:00-17:00" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label>Target Agent ID</Label>
              <Input 
                value={formData.target_agent_id} 
                onChange={(e) => setFormData({...formData, target_agent_id: e.target.value, target_queue: ''})} 
                placeholder="Specific user ID" 
                disabled={!!formData.target_queue}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Queue</Label>
              <Input 
                value={formData.target_queue} 
                onChange={(e) => setFormData({...formData, target_queue: e.target.value, target_agent_id: ''})} 
                placeholder="e.g. tier1_support" 
                disabled={!!formData.target_agent_id}
              />
            </div>
          </div>
          
          {(!formData.target_agent_id && !formData.target_queue) && (
            <div className="flex items-center gap-2 text-warning text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>You must specify either a target agent or a queue.</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
              />
              <Label>Rule is active</Label>
            </div>
            <Button type="button" variant="secondary" onClick={handleTestRoute} disabled={testing}>
              {testing ? 'Testing...' : 'Test Routing'}
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || (!formData.target_agent_id && !formData.target_queue)}>
            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Rule</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoutingRuleBuilder;