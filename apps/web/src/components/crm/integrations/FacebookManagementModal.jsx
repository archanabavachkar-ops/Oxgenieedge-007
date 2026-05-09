import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Input } from '@/components/ui/input.jsx';
import { CheckCircle2, Copy, Play, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import TestLeadModal from './TestLeadModal.jsx';

const FacebookManagementModal = ({ isOpen, onClose, integrationData, onDisconnected }) => {
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  const webhookUrl = `${window.location.origin}/hcgi/api/integrations/facebook/webhook`;

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, statusFilter]);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const filterStr = statusFilter !== 'all' ? `status = "${statusFilter}"` : '';
      const records = await pb.collection('webhook_logs').getList(1, 20, {
        filter: filterStr,
        sort: '-timestamp',
        $autoCancel: false
      });
      setLogs(records.items);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Fallback/empty gracefully without crashing
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Facebook Lead Ads? Leads will no longer be synced.')) {
      return;
    }
    
    try {
      if (integrationData?.id) {
        await pb.collection('facebook_integrations').delete(integrationData.id, { $autoCancel: false });
      }
      toast.success('Facebook Lead Ads disconnected');
      if (onDisconnected) onDisconnected();
      onClose();
    } catch (error) {
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl">Manage Facebook Lead Ads</DialogTitle>
            <Badge className="bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.15)]">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
            </Badge>
          </div>
          <DialogDescription>
            Configure webhook settings, monitor sync status, and view recent lead captures.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="col-span-1 space-y-6">
            {/* Stats Block */}
            <div className="bg-muted rounded-xl p-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads Imported</p>
                <p className="text-2xl font-bold">{integrationData?.totalLeadsImported || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium">
                  {integrationData?.lastSyncTime 
                    ? new Date(integrationData.lastSyncTime).toLocaleString() 
                    : 'No syncs yet'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={() => setIsTestModalOpen(true)} className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" /> Send Test Lead
              </Button>
              <Button onClick={handleDisconnect} className="w-full text-destructive hover:bg-destructive/10" variant="ghost">
                <Trash2 className="w-4 h-4 mr-2" /> Disconnect Integration
              </Button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-6">
            {/* Webhook Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Webhook Configuration (Step 3)</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Webhook Callback URL</label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="bg-muted/50 font-mono text-sm" />
                  <Button variant="secondary" onClick={() => handleCopy(webhookUrl, 'URL')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Verify Token</label>
                <div className="flex gap-2">
                  <Input readOnly value={integrationData?.webhookVerifyToken || 'Not generated'} className="bg-muted/50 font-mono text-sm" />
                  <Button variant="secondary" onClick={() => handleCopy(integrationData?.webhookVerifyToken, 'Verify Token')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Webhook Logs */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Recent Webhook Logs</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-8">
                    <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Endpoint / Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLogs ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Loading logs...</TableCell>
                      </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No events found.</TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(log.timestamp || log.created).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">
                            {log.endpoint || 'Facebook Lead Webhook'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              log.status === 'success' ? 'text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]' :
                              log.status === 'failed' ? 'text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.3)]' :
                              'text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)]'
                            }>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                              console.log('Payload:', log.payload);
                              toast.info('Check browser console for payload data');
                            }}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <TestLeadModal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)}
        onSuccess={fetchLogs} 
      />
    </Dialog>
  );
};

export default FacebookManagementModal;