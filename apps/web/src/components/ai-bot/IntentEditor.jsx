import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Plus, MessageSquare, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';

const IntentEditor = ({ isOpen, onClose, intent, onSave }) => {
  const [formData, setFormData] = useState({
    name: intent?.name || '',
    category: intent?.category || 'General',
    description: intent?.description || '',
    examples: intent?.examples ? [...intent.examples] : [],
    confidence: intent?.confidence || 0
  });
  
  const [newExample, setNewExample] = useState('');

  const handleAddExample = () => {
    if (!newExample.trim()) return;
    if (formData.examples.includes(newExample.trim())) {
      toast.error('This example phrase already exists.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      examples: [newExample.trim(), ...prev.examples]
    }));
    setNewExample('');
  };

  const handleRemoveExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Intent name is required');
      return;
    }
    if (formData.examples.length < 3) {
      toast.warning('Provide at least 3 examples for better training accuracy.');
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-automation-primary" />
            {intent ? 'Edit Intent' : 'Create Intent'}
          </DialogTitle>
          <DialogDescription>
            Define what the user is trying to accomplish and provide varied examples.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intentName">Intent Name</Label>
              <Input 
                id="intentName" 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                placeholder="e.g., Order_Status"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                value={formData.category} 
                onChange={e => setFormData(p => ({...p, category: e.target.value}))} 
                placeholder="e.g., Support"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={e => setFormData(p => ({...p, description: e.target.value}))} 
              placeholder="What does this intent capture?"
              className="resize-none h-16"
            />
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Training Examples ({formData.examples.length})</h3>
                <p className="text-sm text-muted-foreground">Provide various ways a user might express this intent.</p>
              </div>
              {formData.confidence > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Current Accuracy:</span>
                  <span className="font-bold text-success tabular-nums">{formData.confidence}%</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input 
                value={newExample}
                onChange={e => setNewExample(e.target.value)}
                placeholder="e.g., Where is my package?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExample();
                  }
                }}
              />
              <Button type="button" onClick={handleAddExample} className="bg-automation-primary hover:bg-automation-primary/90 text-white shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-0">
                {formData.examples.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No examples yet.</p>
                    <p className="text-xs opacity-70">Add phrases above to start training.</p>
                  </div>
                ) : (
                  <ul className="max-h-[300px] overflow-y-auto divide-y divide-border/50">
                    {formData.examples.map((ex, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 hover:bg-muted/30 group transition-colors">
                        <span className="text-sm">{ex}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveExample(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-automation-primary hover:bg-automation-primary/90 text-white">
            <Save className="h-4 w-4 mr-2" /> Save Intent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntentEditor;