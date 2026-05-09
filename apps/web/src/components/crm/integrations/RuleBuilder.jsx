import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const RuleBuilder = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rule, setRule] = useState(initialData || {
    name: '',
    trigger_integration: '',
    trigger_event: '',
    conditions: [{ field: '', operator: 'equals', value: '' }],
    actions: [{ type: 'create_lead', config: '' }],
    is_active: true
  });

  const handleSave = async () => {
    if (!rule.name || !rule.trigger_integration || !rule.trigger_event) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...rule,
        conditions: JSON.stringify(rule.conditions),
        actions: JSON.stringify(rule.actions)
      };

      if (initialData?.id) {
        await pb.collection('automation_rules').update(initialData.id, payload, { $autoCancel: false });
        toast.success('Rule updated successfully');
      } else {
        await pb.collection('automation_rules').create(payload, { $autoCancel: false });
        toast.success('Rule created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setIsLoading(false);
    }
  };

  const addCondition = () => {
    setRule({ ...rule, conditions: [...rule.conditions, { field: '', operator: 'equals', value: '' }] });
  };

  const removeCondition = (index) => {
    const newConditions = [...rule.conditions];
    newConditions.splice(index, 1);
    setRule({ ...rule, conditions: newConditions });
  };

  const updateCondition = (index, key, value) => {
    const newConditions = [...rule.conditions];
    newConditions[index][key] = value;
    setRule({ ...rule, conditions: newConditions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Automation Rule' : 'Create Automation Rule'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Rule Name <span className="text-destructive">*</span></Label>
            <Input 
              value={rule.name} 
              onChange={(e) => setRule({...rule, name: e.target.value})} 
              placeholder="e.g., Create lead from new Shopify order"
              className="text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
            <div className="space-y-2">
              <Label>Trigger Integration <span className="text-destructive">*</span></Label>
              <Select value={rule.trigger_integration} onValueChange={(v) => setRule({...rule, trigger_integration: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="facebook">Facebook Lead Ads</SelectItem>
                  <SelectItem value="webhook">Custom Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trigger Event <span className="text-destructive">*</span></Label>
              <Select value={rule.trigger_event} onValueChange={(v) => setRule({...rule, trigger_event: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order.created">Order Created</SelectItem>
                  <SelectItem value="customer.created">Customer Created</SelectItem>
                  <SelectItem value="payment.succeeded">Payment Success</SelectItem>
                  <SelectItem value="lead.captured">Lead Captured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base">Conditions</Label>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="w-4 h-4 mr-1" /> Add Condition
              </Button>
            </div>
            
            {rule.conditions.map((cond, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Input 
                  placeholder="Field (e.g., amount)" 
                  value={cond.field} 
                  onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                  className="flex-1 text-foreground"
                />
                <Select value={cond.operator} onValueChange={(v) => updateCondition(idx, 'operator', v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Value" 
                  value={cond.value} 
                  onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                  className="flex-1 text-foreground"
                />
                <Button variant="ghost" size="icon" onClick={() => removeCondition(idx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {rule.conditions.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No conditions set. Rule will trigger on every event.</div>
            )}
          </div>

          <div className="flex justify-center py-2">
            <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Actions</Label>
            <div className="p-4 border rounded-xl bg-card space-y-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select 
                  value={rule.actions[0].type} 
                  onValueChange={(v) => setRule({...rule, actions: [{...rule.actions[0], type: v}]})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_lead">Create Lead in CRM</SelectItem>
                    <SelectItem value="update_deal">Update Deal Stage</SelectItem>
                    <SelectItem value="send_email">Send Email Notification</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RuleBuilder;