import React, { useState, useEffect } from 'react';
import CrmLayout from '@/components/CrmLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Upload, BrainCircuit, Edit, Trash2 } from 'lucide-react';
import IntentEditor from '@/components/ai-bot/IntentEditor';
import { toast } from 'sonner';

const MOCK_INTENTS = [
  { id: '1', name: 'Order_Status', category: 'Support', examples: ['Where is my package?', 'Track order 123', 'Has my item shipped?'], confidence: 92 },
  { id: '2', name: 'Cancel_Subscription', category: 'Billing', examples: ['I want to cancel', 'End my membership', 'Stop charging me'], confidence: 88 },
  { id: '3', name: 'Pricing_Query', category: 'Sales', examples: ['How much does it cost?', 'What are the plans?', 'Price for enterprise?'], confidence: 95 },
  { id: '4', name: 'Reset_Password', category: 'Support', examples: ['Forgot my password', 'Cannot log in', 'Reset access'], confidence: 98 },
];

const IntentTrainingPage = () => {
  const [intents, setIntents] = useState(MOCK_INTENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIntent, setEditingIntent] = useState(null);

  const categories = ['all', ...new Set(MOCK_INTENTS.map(i => i.category))];

  const handleOpenEditor = (intent = null) => {
    setEditingIntent(intent);
    setEditorOpen(true);
  };

  const handleSaveIntent = (savedData) => {
    if (editingIntent) {
      setIntents(prev => prev.map(i => i.id === editingIntent.id ? { ...i, ...savedData } : i));
      toast.success('Intent updated');
    } else {
      setIntents(prev => [{ ...savedData, id: Date.now().toString(), confidence: 0 }, ...prev]);
      toast.success('Intent created');
    }
    setEditorOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this intent? This will affect bot accuracy.')) {
      setIntents(prev => prev.filter(i => i.id !== id));
      toast.success('Intent deleted');
    }
  };

  const filteredIntents = intents.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <CrmLayout title="Intent Training">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Intent Training</h1>
            <p className="text-muted-foreground mt-1">Train your AI models to understand customer goals and meanings.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-card">
              <Upload className="h-4 w-4 mr-2" /> Import CSV
            </Button>
            <Button onClick={() => handleOpenEditor()} className="bg-automation-primary hover:bg-automation-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Intent
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search intents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border/50 shadow-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] bg-card border-border/50 shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="secondary" className="gap-2" onClick={() => toast.info('Training model in background...')}>
            <BrainCircuit className="h-4 w-4" /> Retrain Model
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Intent Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Examples</TableHead>
                <TableHead className="text-right">Accuracy Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntents.map((intent) => (
                <TableRow key={intent.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    {intent.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {intent.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {intent.examples?.length || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${intent.confidence >= 90 ? 'bg-success' : intent.confidence >= 80 ? 'bg-warning' : 'bg-destructive'}`} 
                          style={{ width: `${intent.confidence}%` }} 
                        />
                      </div>
                      <span className="font-medium tabular-nums w-8">{intent.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditor(intent)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(intent.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIntents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No intents match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <IntentEditor 
        isOpen={editorOpen} 
        onClose={() => setEditorOpen(false)} 
        intent={editingIntent}
        onSave={handleSaveIntent}
      />
    </CrmLayout>
  );
};

export default IntentTrainingPage;