import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MessageSquare as MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useBotTemplates } from '@/hooks/useBotTemplates.js';

export default function BotTemplateManager({ onTemplatesChange }) {
  const { templates, isLoading, loadTemplates, createTemplate, updateTemplate, deleteTemplate } = useBotTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ intent: '', response: '', keywords: '' });

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (onTemplatesChange) {
      onTemplatesChange(templates);
    }
  }, [templates, onTemplatesChange]);

  const handleCreateNew = () => {
    setFormData({ intent: '', response: '', keywords: '' });
    setIsCreating(true);
    setEditingId(null);
  };

  const handleEdit = (template) => {
    setFormData({
      intent: template.intent,
      response: template.response,
      keywords: Array.isArray(template.keywords) ? template.keywords.join(', ') : ''
    });
    setEditingId(template.id);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ intent: '', response: '', keywords: '' });
  };

  const handleSave = async () => {
    if (!formData.intent || !formData.response) return;

    const payload = {
      intent: formData.intent.toLowerCase().replace(/\s+/g, '_'),
      response: formData.response,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    try {
      if (isCreating) {
        await createTemplate(payload);
      } else if (editingId) {
        await updateTemplate(editingId, payload);
      }
      handleCancel();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Response Templates
          </CardTitle>
          <CardDescription>Manage intents and bot responses</CardDescription>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={handleCreateNew} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Template
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {(isCreating || editingId) && (
          <div className="p-4 bg-muted/30 border-b space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Intent Name</label>
                <Input 
                  placeholder="e.g., refund_request" 
                  value={formData.intent}
                  onChange={(e) => setFormData({...formData, intent: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords (comma separated)</label>
                <Input 
                  placeholder="refund, money back, return" 
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bot Response</label>
              <Textarea 
                placeholder="Type the response the bot should give..." 
                value={formData.response}
                onChange={(e) => setFormData({...formData, response: e.target.value})}
                className="min-h-[100px] bg-background"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.intent || !formData.response || isLoading}>
                {isLoading ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="divide-y">
          {isLoading && !isCreating && !editingId && templates.length === 0 ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 && !isCreating ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquareText className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No templates found.</p>
              <Button variant="link" onClick={handleCreateNew} className="mt-2">Create your first template</Button>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="p-4 hover:bg-muted/20 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{template.intent}</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(template.keywords) && template.keywords.slice(0, 3).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {kw}
                          </Badge>
                        ))}
                        {Array.isArray(template.keywords) && template.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            +{template.keywords.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.response}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}