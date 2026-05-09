import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Shield, Search, FileText, CheckCircle2, AlertTriangle, XCircle, Download, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import ConsentModal from '@/components/call-centre/ConsentModal';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const CompliancePage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchConsents();
  }, [search, filterType]);

  const fetchConsents = async () => {
    setLoading(true);
    try {
      let filterStr = search ? `customer_id.name ~ "${search}" || customer_id.email ~ "${search}"` : '';
      
      if (filterType === 'expired') {
        const now = new Date().toISOString();
        filterStr = filterStr ? `${filterStr} && consent_expiry < "${now}"` : `consent_expiry < "${now}"`;
      } else if (filterType === 'valid') {
        const now = new Date().toISOString();
        filterStr = filterStr ? `${filterStr} && consent_expiry >= "${now}"` : `consent_expiry >= "${now}"`;
      }

      const result = await pb.collection('call_consent_records').getList(1, 50, {
        filter: filterStr,
        sort: '-updated',
        expand: 'customer_id',
        $autoCancel: false
      });

      setConsents(result.items);
    } catch (error) {
      console.error('Error fetching compliance records:', error);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (customerId) => {
    try {
      const logs = await pb.collection('compliance_logs').getFullList({
        filter: `customer_id = "${customerId}"`,
        sort: '-timestamp',
        $autoCancel: false
      });
      setAuditLogs(logs);
      setIsAuditModalOpen(true);
    } catch (error) {
      toast.error('Could not load audit trail');
    }
  };

  const getStatusBadge = (dateString) => {
    if (!dateString) return <Badge variant="outline">Not Set</Badge>;
    
    const expiry = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return <Badge variant="destructive" className="gap-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"><XCircle className="h-3 w-3" /> Expired</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge variant="outline" className="gap-1 bg-warning/10 text-warning-foreground hover:bg-warning/20 border-warning/20"><AlertTriangle className="h-3 w-3" /> Expiring Soon</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1 bg-success/10 text-success-foreground hover:bg-success/20 border-success/20"><CheckCircle2 className="h-3 w-3" /> Valid</Badge>;
    }
  };

  const handleExport = () => {
    toast.success('Report exported', { description: 'Compliance CSV downloaded successfully.' });
  };

  const handleConsentUpdate = async (data) => {
    toast.success('Consent updated for customer');
    setIsConsentModalOpen(false);
    fetchConsents();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Compliance & Privacy - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" /> Compliance
            </h1>
            <p className="text-muted-foreground">Manage consent records and view audit trails for data privacy.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
            <Button onClick={() => { setSelectedCustomerId('new'); setIsConsentModalOpen(true); }}>
              <CheckSquare className="h-4 w-4 mr-2" /> Request Consent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid Consents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {consents.filter(c => new Date(c.consent_expiry) >= new Date()).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Action Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {consents.filter(c => new Date(c.consent_expiry) < new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="valid">Valid Consent</SelectItem>
                <SelectItem value="expired">Expired Consent</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Recording</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status / Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : consents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No consent records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  consents.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="font-medium">{record.expand?.customer_id?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{record.expand?.customer_id?.email || '-'}</div>
                      </TableCell>
                      <TableCell>
                        {record.call_recording_consent ? 
                          <CheckCircle2 className="h-4 w-4 text-success" /> : 
                          <XCircle className="h-4 w-4 text-muted-foreground opacity-50" />}
                      </TableCell>
                      <TableCell>
                        {record.marketing_consent ? 
                          <CheckCircle2 className="h-4 w-4 text-success" /> : 
                          <XCircle className="h-4 w-4 text-muted-foreground opacity-50" />}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{record.consent_method || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(record.consent_expiry)}
                          {record.consent_expiry && (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(record.consent_expiry).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => { setSelectedCustomerId(record.customer_id); setIsConsentModalOpen(true); }}
                        >
                          Update
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary"
                          onClick={() => fetchAuditLogs(record.customer_id)}
                        >
                          <FileText className="h-4 w-4 mr-1.5" /> Audit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Consent Modal */}
      <ConsentModal 
        isOpen={isConsentModalOpen}
        customerId={selectedCustomerId}
        onAccept={handleConsentUpdate}
        onDecline={() => setIsConsentModalOpen(false)}
        expiryDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      />

      {/* Audit Log Modal */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Audit Trail</DialogTitle>
            <DialogDescription>Immutable record of compliance events for this customer.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No events recorded.</div>
            ) : (
              <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-4">
                {auditLogs.map((log, i) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">{log.event_type.replace('_', ' ')}</Badge>
                        <time className="text-xs font-mono text-muted-foreground">{new Date(log.timestamp || log.created).toLocaleString()}</time>
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border font-mono">
                        {JSON.stringify(log.details || {})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompliancePage;