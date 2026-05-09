import React, { useState } from 'react';
import CrmLayout from '@/components/CrmLayout';
import WorkflowCanvas from '@/components/automation/WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Play, Share, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const WorkflowBuilderPage = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Workflow saved successfully');
    }, 1000);
  };

  return (
    <CrmLayout title="Workflow Builder">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b mb-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/automation/rules')} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold leading-none">New Lead Routing</h1>
                <Badge className="bg-automation-primary hover:bg-automation-primary text-white">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Assigns high-value leads immediately to Senior Reps.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 border-r pr-4 mr-1">
              <History className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="v3">
                <SelectTrigger className="h-9 w-28 bg-transparent border-0 shadow-none focus:ring-0 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v3">v3 (Current)</SelectItem>
                  <SelectItem value="v2">v2</SelectItem>
                  <SelectItem value="v1">v1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="gap-2 bg-card">
              <Play className="h-4 w-4 text-automation-primary" /> Test
            </Button>
            <Button variant="default" className="gap-2 bg-automation-primary hover:bg-automation-primary/90 text-white" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save & Publish'}
            </Button>
          </div>
        </div>

        {/* Visual Builder Canvas */}
        <div className="flex-1 min-h-0 bg-muted/5 rounded-2xl">
          <WorkflowCanvas />
        </div>
      </div>
    </CrmLayout>
  );
};

export default WorkflowBuilderPage;