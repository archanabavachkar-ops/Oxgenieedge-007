import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Calendar as CalendarIcon, PlayCircle, Download, Trash2, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import RecordingPlayer from '@/components/call-centre/RecordingPlayer';
import TranscriptionViewer from '@/components/call-centre/TranscriptionViewer';
import CallSummary from '@/components/call-centre/CallSummary';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const CallRecordingsPage = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [activeRecording, setActiveRecording] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [deleteData, setDeleteData] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, [page, search]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      // Using pocketbase directly to get global list as it's more efficient for tables with joins
      const filter = search ? `call_id.customer_id.name ~ "${search}" || id ~ "${search}"` : '';
      
      const result = await pb.collection('call_recordings').getList(page, 10, {
        filter,
        sort: '-created',
        expand: 'call_id, call_id.customer_id',
        $autoCancel: false
      });

      setRecordings(result.items);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast.error('Could not load call recordings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (recording) => {
    setActiveRecording(recording);
    setIsPlayerOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteData) return;
    try {
      // Deleting via API could be better if it involves S3 cleanup, but PB SDK works for DB
      await pb.collection('call_recordings').delete(deleteData.id, { $autoCancel: false });
      toast.success('Recording deleted successfully');
      fetchRecordings();
    } catch (error) {
      toast.error('Failed to delete recording');
    } finally {
      setDeleteData(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Mock fetching transcription for the UI
  const getTranscriptionMock = () => {
    return {
      text: "Hello, thank you for calling support. How can I help you today? \nI need help with my recent order, it hasn't arrived. \nI can certainly check that for you. May I have your order number? \nYes, it's AB12345. \nThank you. I see it was dispatched yesterday and should arrive by tomorrow.",
      confidence: 0.92
    };
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Call Recordings - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Recordings</h1>
            <p className="text-muted-foreground">Manage and analyze your recorded customer conversations.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID or customer..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" /> Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Call Details</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Analysis</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recordings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No recordings found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  recordings.map((rec) => {
                    const call = rec.expand?.call_id;
                    const customerName = call?.expand?.customer_id?.name || 'Unknown Customer';
                    const callDate = new Date(rec.created).toLocaleString();
                    
                    return (
                      <TableRow key={rec.id}>
                        <TableCell className="text-sm font-medium">{callDate}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{customerName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{call?.phone_number || rec.call_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{formatDuration(rec.duration)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rec.file_size ? `${(rec.file_size / 1024 / 1024).toFixed(1)} MB` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20" title="Transcribed">
                              <FileText className="h-3 w-3 mr-1" /> TXT
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" title="Summary Available">
                              <BarChart3 className="h-3 w-3 mr-1" /> SUM
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handlePlay(rec)} title="Play & Analyze">
                              <PlayCircle className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteData(rec)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Player & Analysis Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Recording Analysis: {activeRecording?.expand?.call_id?.phone_number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b shrink-0 bg-muted/10">
              <RecordingPlayer 
                recordingUrl={activeRecording?.recording_url || '#'} 
                recordingId={activeRecording?.id}
                duration={activeRecording?.duration}
              />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
              <div className="h-full">
                <TranscriptionViewer 
                  transcriptionText={getTranscriptionMock().text}
                  confidence={getTranscriptionMock().confidence}
                />
              </div>
              <div className="h-full">
                <CallSummary 
                  summary="The customer called to inquire about a delayed order (AB12345). The agent verified the status and confirmed dispatch, estimating delivery by tomorrow. The customer was satisfied with the update."
                  keyPoints={['Order AB12345 delayed query', 'Status: Dispatched yesterday', 'Expected: Tomorrow']}
                  sentiment="positive"
                  actionItems={['Monitor tracking for AB12345']}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Delete Recording
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recording? It will be permanently removed along with its transcriptions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteData(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallRecordingsPage;