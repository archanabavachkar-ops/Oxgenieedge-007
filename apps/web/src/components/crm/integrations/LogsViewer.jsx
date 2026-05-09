import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.jsx';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient';

const LogsViewer = ({ integrationId }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Mocking logs since backend endpoints might not be fully populated yet
      const mockLogs = [
        { id: '1', created: new Date().toISOString(), event_type: 'contact.created', status: 'success', duration_ms: 145, request_data: '{"email":"test@example.com"}', response_data: '{"id":"ext_123"}' },
        { id: '2', created: new Date(Date.now() - 3600000).toISOString(), event_type: 'deal.updated', status: 'failed', duration_ms: 890, error_message: 'API Rate limit exceeded', request_data: '{"deal_id":"456"}', response_data: '{"error":"rate_limit"}' },
        { id: '3', created: new Date(Date.now() - 7200000).toISOString(), event_type: 'sync.full', status: 'success', duration_ms: 4500, request_data: '{}', response_data: '{"synced": 45}' },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [integrationId]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLogs = logs.filter(log => filterStatus === 'all' || log.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading logs...</TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No logs found.</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(log.id)}>
                    <TableCell>
                      {expandedRows[log.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </TableCell>
                    <TableCell className="font-medium">{format(new Date(log.created), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        log.status === 'success' ? 'bg-success/10 text-success border-success/20' : 
                        log.status === 'failed' ? 'bg-error/10 text-error border-error/20' : ''
                      }>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{log.duration_ms}ms</TableCell>
                  </TableRow>
                  {expandedRows[log.id] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-4 space-y-4 text-sm">
                          {log.error_message && (
                            <div className="text-error font-medium">Error: {log.error_message}</div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="font-semibold mb-1 text-muted-foreground">Request Data</div>
                              <pre className="bg-background p-3 rounded-lg border overflow-x-auto text-xs">
                                {log.request_data ? JSON.stringify(JSON.parse(log.request_data), null, 2) : '{}'}
                              </pre>
                            </div>
                            <div>
                              <div className="font-semibold mb-1 text-muted-foreground">Response Data</div>
                              <pre className="bg-background p-3 rounded-lg border overflow-x-auto text-xs">
                                {log.response_data ? JSON.stringify(JSON.parse(log.response_data), null, 2) : '{}'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogsViewer;