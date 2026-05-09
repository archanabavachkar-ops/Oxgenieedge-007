import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Settings2, PhoneCall, Volume2, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const IVRFlowBuilder = ({ isOpen, onClose, flow, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    steps: []
  });

  useEffect(() => {
    if (isOpen) {
      if (flow) {
        setFormData({
          name: flow.name || '',
          description: flow.description || '',
          is_active: flow.is_active ?? true,
          steps: Array.isArray(flow.steps) ? flow.steps : []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          is_active: true,
          steps: [{ id: `step_${Date.now()}`, type: 'prompt', message: 'Welcome to our service.', next_steps: {} }]
        });
      }
    }
  }, [isOpen, flow]);

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: `step_${Date.now()}`, type: 'prompt', message: '', next_steps: {} }
      ]
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleMoveStep = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === formData.steps.length - 1)) return;
    
    setFormData(prev => {
      const newSteps = [...prev.steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + direction];
      newSteps[index + direction] = temp;
      return { ...prev, steps: newSteps };
    });
  };

  const handleStepChange = (index, field, value) => {
    setFormData(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      
      if (field === 'type' && value !== 'menu') {
        newSteps[index].next_steps = {};
      }
      
      return { ...prev, steps: newSteps };
    });
  };

  const handleNextStepMapping = (stepIndex, digit, targetStepId) => {
    setFormData(prev => {
      const newSteps = [...prev.steps];
      const nextSteps = { ...(newSteps[stepIndex].next_steps || {}) };
      
      if (targetStepId) {
        nextSteps[digit] = targetStepId;
      } else {
        delete nextSteps[digit];
      }
      
      newSteps[stepIndex].next_steps = nextSteps;
      return { ...prev, steps: newSteps };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Flow name is required');
      return;
    }
    if (formData.steps.length === 0) {
      toast.error('At least one step is required');
      return;
    }

    setLoading(true);
    try {
      const url = flow ? `/ivr/flows/${flow.id}` : '/ivr/flows';
      const method = flow ? 'PUT' : 'POST';
      
      const response = await apiServerClient.fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save flow');
      }
      
      toast.success(flow ? 'Flow updated successfully' : 'Flow created successfully');
      onSave(data.flow || data);
      onClose();
    } catch (error) {
      console.error('Error saving IVR flow:', error);
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'prompt': return <Volume2 className="h-4 w-4" />;
      case 'menu': return <KeyRound className="h-4 w-4" />;
      case 'transfer': return <PhoneCall className="h-4 w-4" />;
      default: return <Settings2 className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{flow ? 'Edit IVR Flow' : 'Create IVR Flow'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          {/* General Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Flow Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Main Customer Support" 
              />
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
                />
                <span className="text-sm font-medium">{formData.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description of this flow's purpose" 
              />
            </div>
          </div>

          {/* Steps Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Flow Steps</h3>
              <Button type="button" size="sm" onClick={handleAddStep}>
                <Plus className="mr-2 h-4 w-4" /> Add Step
              </Button>
            </div>

            {formData.steps.map((step, index) => (
              <Card key={step.id} className="border-border shadow-sm">
                <CardContent className="p-4 flex gap-4">
                  {/* Controls */}
                  <div className="flex flex-col items-center gap-1 border-r pr-4">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStep(index, -1)} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="w-8 justify-center rounded-sm font-mono">{index + 1}</Badge>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStep(index, 1)} disabled={index === formData.steps.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive mt-2 hover:bg-destructive/10" onClick={() => handleRemoveStep(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Step Configuration */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                          {getStepIcon(step.type)}
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">ID: {step.id}</span>
                      </div>
                      <Select value={step.type} onValueChange={(val) => handleStepChange(index, 'type', val)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Step Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prompt">Prompt (Speak & Wait)</SelectItem>
                          <SelectItem value="menu">Menu (Gather DTMF)</SelectItem>
                          <SelectItem value="transfer">Transfer Call</SelectItem>
                          <SelectItem value="hangup">Hangup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{step.type === 'transfer' ? 'Transfer Number / Target' : 'Message to Speak (TTS)'}</Label>
                      {step.type === 'transfer' ? (
                        <Input 
                          value={step.message || ''} 
                          onChange={(e) => handleStepChange(index, 'message', e.target.value)} 
                          placeholder="e.g. +1234567890 or queue_sales" 
                        />
                      ) : step.type !== 'hangup' ? (
                        <Textarea 
                          value={step.message || ''} 
                          onChange={(e) => handleStepChange(index, 'message', e.target.value)} 
                          placeholder="e.g. Welcome to our company. Please press 1 for sales..." 
                          className="min-h-[80px]"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Call will be disconnected after the previous step completes.</p>
                      )}
                    </div>

                    {step.type === 'menu' && (
                      <div className="pt-2 border-t space-y-3">
                        <Label>DTMF Routing (Press Key → Target Step)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#'].map(digit => (
                            <div key={digit} className="flex items-center gap-2">
                              <Badge className="w-8 justify-center shrink-0" variant="secondary">{digit}</Badge>
                              <Select 
                                value={step.next_steps?.[digit] || "none"} 
                                onValueChange={(val) => handleNextStepMapping(index, digit, val === 'none' ? null : val)}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder="Select target step" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="text-muted-foreground italic">Unassigned</SelectItem>
                                  {formData.steps.map((s, i) => (
                                    s.id !== step.id && <SelectItem key={s.id} value={s.id}>Step {i + 1} ({s.type})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Flow'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IVRFlowBuilder;