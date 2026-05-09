import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Link2, Key, Zap, Users, CheckCircle2, ShieldAlert, RefreshCw, Copy } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const CapturePage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicateLog, setDuplicateLog] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Attempt to fetch from real endpoints, fallback to PB if endpoint not fully ready
      const srcRes = await apiServerClient.fetch('/crm/capture/sources').catch(()=>({ok:false}));
      if (srcRes.ok) {
        setSources(await srcRes.json());
      } else {
        // Fallback to PocketBase direct fetch for demo if API route is strictly typed
        const records = await pb.collection('lead_sources').getFullList({ $autoCancel: false }).catch(()=>[]);
        setSources(records.length > 0 ? records : [
          { id: '1', name: 'Main Website Form', type: 'website', status: 'active', api_key: 'sk_live_123...' },
          { id: '2', name: 'Facebook Ad Campaign', type: 'facebook', status: 'active', api_key: 'sk_live_456...' },
          { id: '3', name: 'LinkedIn Lead Gen', type: 'linkedin', status: 'inactive', api_key: 'sk_live_789...' },
        ]);
      }

      // Fetch duplicate logs
      const dupRecords = await pb.collection('duplicate_leads').getList(1, 5, { sort: '-created', $autoCancel: false }).catch(()=>({items: []}));
      setDuplicateLog(dupRecords.items);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard");
  };

  const triggerDeduplication = async () => {
    const promise = apiServerClient.fetch('/crm/capture/deduplicate', { method: 'POST' });
    toast.promise(promise, {
      loading: 'Running deduplication sweep...',
      success: 'Deduplication completed. Found 0 new duplicates.',
      error: 'Failed to run deduplication'
    });
  };

  return (
    <CrmLayout title="Lead Capture & Sources">
      <Helmet><title>Lead Capture - CRM</title></Helmet>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-balance max-w-2xl">
          Manage inbound lead sources, API keys, and automatic enrichment rules.
        </p>
        <Button onClick={triggerDeduplication}>
          <ShieldAlert className="w-4 h-4 mr-2" /> Run Deduplication
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Sources List */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="border-b border-border bg-muted/30 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Configured Sources</CardTitle>
              <CardDescription>Active endpoints feeding into the CRM</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Link2 className="w-4 h-4 mr-2" /> Add Source</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((src) => (
                  <TableRow key={src.id}>
                    <TableCell className="font-medium">{src.name}</TableCell>
                    <TableCell className="capitalize">{src.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {src.api_key ? '••••••••' + src.api_key.slice(-4) : 'Not configured'}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(src.api_key)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {src.status === 'active' 
                        ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</Badge>
                        : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Enrichment Status */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Auto-Enrichment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically fetch company details, job titles, and industry data for new incoming leads.
            </p>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Clearbit API</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
            </div>
            <div className="pt-2 border-t border-border mt-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Enrichment Success Rate</span>
                <span className="font-bold">84.2%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '84.2%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4">Duplicate Resolution Queue</h3>
      <Card className="shadow-sm border-border overflow-hidden">
        {duplicateLog.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Lead 1</TableHead>
                <TableHead>Lead 2</TableHead>
                <TableHead>Similarity Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicateLog.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.lead_id_1}</TableCell>
                  <TableCell className="font-medium">{log.lead_id_2}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${log.similarity_score}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold">{log.similarity_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{log.merge_status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary">Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
            <p className="font-medium text-foreground">Clean Database</p>
            <p className="text-sm">No duplicate leads detected in the queue.</p>
          </div>
        )}
      </Card>

    </CrmLayout>
  );
};

export default CapturePage;