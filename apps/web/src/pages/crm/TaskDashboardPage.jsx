
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Plus, MoreHorizontal, Search, Filter, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Input } from '@/components/ui/input.jsx';
import CreateTaskModal from '@/components/crm/CreateTaskModal.jsx';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';

const PRIORITY_COLORS = {
  high: 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30',
  medium: 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30',
  low: 'bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]'
};

const STATUS_COLORS = {
  to_do: 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/30',
  in_progress: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  completed: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
  cancelled: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
};

const PIE_COLORS = ['#0EA5E9', '#F59E0B', '#22C55E', '#EF4444'];
const BAR_COLORS = { high: '#FF6B00', medium: '#0EA5E9', low: '#94A3B8' };

const TaskDashboardPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('tasks').getFullList({ sort: '-created', expand: 'assigned_to,lead_id', $autoCancel: false });
      setTasks(records);
    } catch (err) { console.error("Error fetching tasks", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCompleteTask = async (id, e) => {
    e.stopPropagation();
    try { await apiServerClient.fetch(`/tasks/${id}/complete`, { method: 'POST' }); fetchTasks(); } catch (err) {}
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;

  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'to_do').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, fill: BAR_COLORS.high },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, fill: BAR_COLORS.medium },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, fill: BAR_COLORS.low }
  ];

  return (
    <CrmLayout title="Task Management" description="Track and manage your team's workflow, follow-ups, and daily activities.">
      <Helmet><title>Tasks - CRM</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Button onClick={() => setCreateModalOpen(true)} className="ml-auto hover-lift">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift"><CardContent className="p-6 flex items-center gap-5"><div className="w-14 h-14 rounded-[16px] bg-gradient-primary flex items-center justify-center text-white glow-primary"><ListTodo className="w-6 h-6" /></div><div><p className="text-sm font-bold text-[#64748B] uppercase tracking-wider font-heading">Total Tasks</p><h3 className="text-3xl font-bold font-numbers">{tasks.length}</h3></div></CardContent></Card>
        <Card className="hover-lift border-[#EF4444]/20"><CardContent className="p-6 flex items-center gap-5"><div className="p-4 bg-[#EF4444]/10 text-[#EF4444] rounded-[16px]"><AlertTriangle className="w-6 h-6" /></div><div><p className="text-sm font-bold text-[#EF4444] uppercase tracking-wider font-heading">Overdue</p><h3 className="text-3xl font-bold font-numbers">{overdueTasks}</h3></div></CardContent></Card>
        <Card className="hover-lift"><CardContent className="p-6 flex items-center gap-5"><div className="p-4 bg-[#22C55E]/10 text-[#22C55E] rounded-[16px]"><CheckCircle2 className="w-6 h-6" /></div><div><p className="text-sm font-bold text-[#64748B] uppercase tracking-wider font-heading">Completed</p><h3 className="text-3xl font-bold font-numbers">{tasks.filter(t => t.status === 'completed').length}</h3></div></CardContent></Card>
        <Card className="hover-lift"><CardContent className="p-6 flex items-center gap-5"><div className="p-4 bg-[#F59E0B]/10 text-[#F59E0B] rounded-[16px]"><Clock className="w-6 h-6" /></div><div><p className="text-sm font-bold text-[#64748B] uppercase tracking-wider font-heading">In Progress</p><h3 className="text-3xl font-bold font-numbers">{tasks.filter(t => t.status === 'in_progress').length}</h3></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1"><CardHeader className="border-b border-[#E2E8F0]"><CardTitle>Status</CardTitle></CardHeader><CardContent className="h-[300px] flex items-center justify-center p-6"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">{statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader className="border-b border-[#E2E8F0]"><CardTitle>Priority Overview</CardTitle></CardHeader><CardContent className="h-[300px] p-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={priorityData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 13, fontWeight: 600, fill: '#64748B'}} /><Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} /><Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>{priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <Card className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="relative w-full max-w-sm"><Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" /><Input placeholder="Search tasks..." className="pl-11 border-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow className="border-none hover:bg-[#0F172A]">
                <TableHead className="w-[300px] pl-6 text-white font-semibold">Task Name</TableHead>
                <TableHead className="text-white font-semibold">Priority</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Due Date</TableHead>
                <TableHead className="text-white font-semibold">Assignee</TableHead>
                <TableHead className="text-right pr-6 text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#FF6B00] mx-auto" /></TableCell></TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-[#64748B] font-bold">No tasks found.</TableCell></TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors" onClick={() => navigate(`/admin/crm/tasks/${task.id}`)}>
                    <TableCell className="pl-6"><div className="font-bold text-[#0F172A]">{task.title}</div></TableCell>
                    <TableCell><Badge className={cn("border font-bold px-3 py-1 rounded-[8px] capitalize", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge></TableCell>
                    <TableCell><Badge className={cn("border font-bold px-3 py-1 rounded-[8px] capitalize", STATUS_COLORS[task.status])}>{task.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="font-semibold text-[#0F172A]">{task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell className="font-semibold text-[#64748B]">{task.expand?.assigned_to?.name || 'Unassigned'}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" className="h-8 w-8 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-[16px] border-[#E2E8F0] shadow-premium-hover p-2">
                          <DropdownMenuItem onClick={() => navigate(`/admin/crm/tasks/${task.id}`)} className="rounded-[10px] font-medium text-[#0F172A]">View Details</DropdownMenuItem>
                          {task.status !== 'completed' && <DropdownMenuItem onClick={(e) => handleCompleteTask(task.id, e)} className="rounded-[10px] font-bold text-[#22C55E] focus:bg-[#22C55E]/10 focus:text-[#22C55E]">Mark Complete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSuccess={fetchTasks} />
    </CrmLayout>
  );
};

export default TaskDashboardPage;
