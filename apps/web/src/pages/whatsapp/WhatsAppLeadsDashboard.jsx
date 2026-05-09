import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { formatPhoneNumber, formatTimestamp } from '@/utils/WhatsAppUtils.js';
import { Search, RefreshCw, MessageSquare, Download, Users, Copy, Check, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const QUICK_REPLIES = [
  "Hi, how can we help you today?",
  "Thank you for reaching out! We'll get back to you shortly.",
  "Your request has been received.",
  "Could you please provide more details?",
];

const STATUS_COLORS = {
  'New Lead': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Attempted Contact': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Connected': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Qualified': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Won': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Lost': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function WhatsAppLeadsDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPhones, setSelectedPhones] = useState([]);
  
  const [previewPhone, setPreviewPhone] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedLogs, fetchedLeads, fetchedUsers] = await Promise.all([
        pb.collection('whatsapp_webhook_logs').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('leads').getFullList({ $autoCancel: false }),
        pb.collection('users').getFullList({ $autoCancel: false })
      ]);
      setLogs(fetchedLogs);
      setLeads(fetchedLeads);
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    pb.collection('whatsapp_webhook_logs').subscribe('*', (e) => {
      if (e.action === 'create') setLogs(prev => [e.record, ...prev]);
      else if (e.action === 'update') setLogs(prev => prev.map(l => l.id === e.record.id ? e.record : l));
    });

    pb.collection('leads').subscribe('*', (e) => {
      if (e.action === 'create') setLeads(prev => [e.record, ...prev]);
      else if (e.action === 'update') setLeads(prev => prev.map(l => l.id === e.record.id ? e.record : l));
    });

    return () => {
      pb.collection('whatsapp_webhook_logs').unsubscribe('*');
      pb.collection('leads').unsubscribe('*');
    };
  }, []);

  // Process data for dashboard
  const { groupedData, analytics } = useMemo(() => {
    const grouped = {};
    logs.forEach(log => {
      if (!grouped[log.from_number]) grouped[log.from_number] = [];
      grouped[log.from_number].push(log);
    });

    const leadMap = leads.reduce((acc, lead) => {
      acc[lead.mobile] = lead;
      return acc;
    }, {});

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const list = Object.entries(grouped).map(([phone, messages]) => {
      const lead = leadMap[phone];
      return {
        phone,
        lead,
        messages: messages.sort((a, b) => new Date(b.created) - new Date(a.created)),
        latestMessage: messages[0],
        messageCount: messages.length,
        status: lead?.status || 'Unassigned',
        assignedTo: lead?.assignedTo ? userMap[lead.assignedTo] : null
      };
    });

    // Analytics Calculation
    const totalLeads = list.length;
    const newLeads24h = list.filter(l => (new Date() - new Date(l.latestMessage.created)) < 86400000).length;
    const converted = list.filter(l => l.status === 'Won').length;
    const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;

    const statusCounts = list.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const hourCounts = logs.reduce((acc, log) => {
      const hour = new Date(log.created).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    const hoursData = Array.from({length: 24}, (_, i) => ({
      hour: `${i}:00`,
      messages: hourCounts[i] || 0
    }));

    return { 
      groupedData: list, 
      analytics: { totalLeads, newLeads24h, conversionRate, statusData, hoursData } 
    };
  }, [logs, leads, users]);

  // Filtering
  const filteredList = useMemo(() => {
    return groupedData.filter(item => {
      const matchesSearch = item.phone.includes(searchTerm) || 
                            item.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.latestMessage.message_text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [groupedData, searchTerm, statusFilter]);

  const handleSelectAll = (checked) => {
    setSelectedPhones(checked ? filteredList.map(item => item.phone) : []);
  };

  const handleSelect = (phone, checked) => {
    setSelectedPhones(prev => checked ? [...prev, phone] : prev.filter(p => p !== phone));
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const promises = selectedPhones.map(phone => {
        const lead = leads.find(l => l.mobile === phone);
        if (lead) {
          return pb.collection('leads').update(lead.id, { status: newStatus }, { $autoCancel: false });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      toast.success(`Updated status for ${selectedPhones.length} leads`);
      setSelectedPhones([]);
    } catch (err) {
      toast.error('Bulk update failed');
    }
  };

  const exportCSV = () => {
    const headers = ['Phone', 'Name', 'Status', 'Assigned To', 'Message Count', 'Latest Message Date'];
    const rows = filteredList.map(item => [
      item.phone,
      `"${item.lead?.name || ''}"`,
      item.status,
      `"${item.assignedTo?.name || 'Unassigned'}"`,
      item.messageCount,
      new Date(item.latestMessage.created).toISOString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'whatsapp_leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQuickReply = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const previewItem = previewPhone ? groupedData.find(d => d.phone === previewPhone) : null;

  const STATUS_COLORS_CHART = ['#3b82f6', '#eab308', '#10b981', '#a855f7', '#6b7280'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp CRM</h1>
          <p className="text-muted-foreground mt-1">Manage conversations, track statuses, and convert leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-2">{loading ? <Skeleton className="h-8 w-20" /> : analytics.totalLeads}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all numbers</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">New Leads (24h)</p>
              <Clock className="w-4 h-4 text-[#25D366]" />
            </div>
            <p className="text-3xl font-bold mt-2">{loading ? <Skeleton className="h-8 w-20" /> : analytics.newLeads24h}</p>
            <p className="text-xs text-muted-foreground mt-1">Recently active</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{loading ? <Skeleton className="h-8 w-20" /> : `${analytics.conversionRate}%`}</p>
            <p className="text-xs text-muted-foreground mt-1">Won vs Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm col-span-1 lg:col-span-1 row-span-2 hidden lg:flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
            {loading ? <Skeleton className="w-32 h-32 rounded-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS_CHART[index % STATUS_COLORS_CHART.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search phone or content..."
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New Lead">New Lead</SelectItem>
                  <SelectItem value="Attempted Contact">Attempted Contact</SelectItem>
                  <SelectItem value="Connected">Connected</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPhones.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 p-1.5 rounded-md px-3 border border-primary/20">
                <span className="text-sm font-medium text-primary mr-2">{selectedPhones.length} selected</span>
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Lead">New Lead</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={filteredList.length > 0 && selectedPhones.length === filteredList.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Latest Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="w-4 h-4 rounded" /></TableCell>
                      <TableCell><Skeleton className="w-32 h-5" /></TableCell>
                      <TableCell><Skeleton className="w-48 h-5" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-5 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="w-24 h-5" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 mb-2 opacity-20" />
                        <p>No conversations found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((item) => (
                    <TableRow key={item.phone} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedPhones.includes(item.phone)}
                          onCheckedChange={(c) => handleSelect(item.phone, c)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.lead?.name || formatPhoneNumber(item.phone)}</span>
                          <span className="text-xs text-muted-foreground">{item.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">{formatTimestamp(item.latestMessage.created)}</span>
                          <span className="truncate text-sm">{item.latestMessage.message_text || '📎 Media Message'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[item.status] || 'bg-muted text-muted-foreground'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                {item.assignedTo.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm">{item.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                          onClick={() => setPreviewPhone(item.phone)}
                        >
                          Preview
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Side Panel Preview */}
      <Sheet open={!!previewPhone} onOpenChange={(o) => !o && setPreviewPhone(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l border-border">
          {previewItem && (
            <>
              <div className="p-6 border-b border-border bg-muted/20">
                <SheetHeader className="text-left space-y-1">
                  <SheetTitle className="text-xl">{previewItem.lead?.name || formatPhoneNumber(previewItem.phone)}</SheetTitle>
                  <SheetDescription>{previewItem.phone}</SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white" onClick={() => navigate(`/whatsapp-leads/${encodeURIComponent(previewItem.phone)}`)}>
                    Open Full Chat
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Recent Messages</h4>
                  <div className="space-y-3">
                    {previewItem.messages.slice(0, 5).map(msg => (
                      <div key={msg.id} className="bg-muted/50 p-3 rounded-lg text-sm border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">{formatTimestamp(msg.created)}</p>
                        <p>{msg.message_text || <span className="italic">Media Message</span>}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Quick Replies</h4>
                  <div className="flex flex-col gap-2">
                    {QUICK_REPLIES.map((reply, idx) => (
                      <Button 
                        key={idx} 
                        variant="outline" 
                        size="sm" 
                        className="justify-start h-auto py-2 px-3 text-left whitespace-normal font-normal text-sm"
                        onClick={() => copyQuickReply(reply, idx)}
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2 text-muted-foreground" />}
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}