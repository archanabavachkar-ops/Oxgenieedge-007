import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowLeft, Calendar, CheckCircle2, Clock, User, Target, Loader2, ListTodo, Paperclip, Activity } from 'lucide-react';
import TaskCommentsSection from '@/components/crm/TaskCommentsSection.jsx';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PRIORITY_COLORS = {
  high: 'bg-[hsl(var(--priority-high))] text-white hover:bg-[hsl(var(--priority-high))/90]',
  medium: 'bg-[hsl(var(--priority-medium))] text-white hover:bg-[hsl(var(--priority-medium))/90]',
  low: 'bg-[hsl(var(--priority-low))] text-white hover:bg-[hsl(var(--priority-low))/90]'
};

const STATUS_COLORS = {
  to_do: 'text-[hsl(var(--status-todo))] bg-[hsl(var(--status-todo))/10] border-[hsl(var(--status-todo))/20]',
  in_progress: 'text-[hsl(var(--status-inprogress))] bg-[hsl(var(--status-inprogress))/10] border-[hsl(var(--status-inprogress))/20]',
  completed: 'text-[hsl(var(--status-completed))] bg-[hsl(var(--status-completed))/10] border-[hsl(var(--status-completed))/20]',
  cancelled: 'text-[hsl(var(--status-cancelled))] bg-[hsl(var(--status-cancelled))/10] border-[hsl(var(--status-cancelled))/20]'
};

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const record = await pb.collection('tasks').getOne(id, {
        expand: 'assigned_to,lead_id,created_by',
        $autoCancel: false
      });
      setTask(record);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load task details");
      navigate('/admin/crm/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await apiServerClient.fetch(`/tasks/${id}/complete`, { method: 'POST' });
      toast.success("Task marked as complete");
      fetchTask();
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setActionLoading(true);
    try {
      await pb.collection('tasks').delete(id, { $autoCancel: false });
      toast.success("Task deleted");
      navigate('/admin/crm/tasks');
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <CrmLayout title="Task Details">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </CrmLayout>
    );
  }

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <CrmLayout title="Task Details">
      <Helmet><title>{task.title} - CRM Tasks</title></Helmet>

      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/crm/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
        </Button>
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleComplete} disabled={actionLoading}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete} disabled={actionLoading}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-shadow overflow-hidden">
            <div className={`h-2 ${PRIORITY_COLORS[task.priority].split(' ')[0]}`}></div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Badge className={`${PRIORITY_COLORS[task.priority]} capitalize font-medium px-2 py-0 border-transparent`}>
                      {task.priority} Priority
                    </Badge>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[task.status]}`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mt-1">{task.title}</h1>
                </div>
                <div className="text-right flex flex-col md:items-end gap-1 shrink-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" /> Due Date
                  </div>
                  <div className={`font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                    {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                  </div>
                  {isOverdue && <span className="text-xs text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full mt-1">Overdue</span>}
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border text-foreground text-sm whitespace-pre-wrap">
                {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
              </div>

              <div className="mt-6 flex gap-6 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-medium text-foreground">{task.expand?.assigned_to?.name || task.expand?.assigned_to?.email || 'Unassigned'}</p>
                  </div>
                </div>
                {task.expand?.lead_id && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-border">
                      <Target className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Related Lead</p>
                      <p className="text-sm font-medium text-foreground">{task.expand.lead_id.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subtasks Placeholder */}
          <Card className="card-shadow">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" /> Subtasks (0/0)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm">No subtasks defined for this task.</p>
              <Button variant="link" className="text-primary mt-2">Add Subtask</Button>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="h-[450px]">
            <TaskCommentsSection taskId={task.id} />
          </div>

          <Card className="card-shadow">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground"><span className="font-medium">{task.expand?.created_by?.name || 'System'}</span> created this task</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(task.created), 'PPp')}</p>
                  </div>
                </div>
                {task.status === 'completed' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">Task marked as completed</p>
                      <p className="text-xs text-muted-foreground">{task.completed_at ? format(new Date(task.completed_at), 'PPp') : format(new Date(task.updated), 'PPp')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmLayout>
  );
};

export default TaskDetailPage;