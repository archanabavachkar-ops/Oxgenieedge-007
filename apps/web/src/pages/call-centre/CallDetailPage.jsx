import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Phone, Clock, User, PlayCircle, Download, FileText, Sparkles, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const CallDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [call, setCall] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        const response = await apiServerClient.fetch(`/call-centre/calls/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setCall(data.call);
          setNotes(data.call.notes || '');
        } else {
          throw new Error(data.error || 'Failed to fetch call details');
        }
      } catch (error) {
        console.error('Error fetching call:', error);
        toast.error('Could not load call details');
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [id]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const response = await apiServerClient.fetch(`/call-centre/calls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        toast.success('Notes saved successfully');
      } else {
        throw new Error('Failed to save notes');
      }
    } catch (error) {
      toast.error('Error saving notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <CallCentreHeader />
        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-muted/30">
        <CallCentreHeader />
        <main className="container max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Call Not Found</h2>
          <Button asChild><Link to="/call-centre/calls">Back to Calls</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Call Details - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
          <Link to="/call-centre/calls"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Calls</Link>
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{call.phone_number}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="capitalize">{call.call_type} Call</span>
                    <span>•</span>
                    <span>{new Date(call.created_at || call.created).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <Clock className="mr-2 h-3 w-3" /> {call.duration || 0}s
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <User className="mr-2 h-3 w-3" /> {call.agent_id || 'Unassigned'}
                </Badge>
                <Badge className={`px-3 py-1 text-sm capitalize ${call.status === 'completed' ? 'bg-success hover:bg-success/90' : ''}`}>
                  {call.status}
                </Badge>
                {call.sentiment && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">
                    Sentiment: {call.sentiment}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Player */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><PlayCircle className="mr-2 h-5 w-5 text-primary" /> Call Recording</CardTitle>
              </CardHeader>
              <CardContent>
                {call.recording_url ? (
                  <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shrink-0">
                        <PlayCircle className="h-5 w-5" />
                      </Button>
                      <div className="h-2 bg-border rounded-full flex-1 overflow-hidden">
                        <div className="h-full bg-primary w-1/3"></div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">00:00 / {call.duration}s</span>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-4">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    No recording available for this call.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcription */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                {call.transcription ? (
                  <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border">
                    {call.transcription}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    Transcription is not available or still processing.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* AI Summary */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg flex items-center text-primary">
                  <Sparkles className="mr-2 h-5 w-5" /> AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {call.call_summary ? (
                  <p className="text-sm leading-relaxed">{call.call_summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">AI summary not generated for this call.</p>
                )}
              </CardContent>
            </Card>

            {/* Agent Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Notes</CardTitle>
                <CardDescription>Add internal notes about this call</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Type your notes here..." 
                  className="min-h-[150px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={handleSaveNotes} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Notes</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallDetailPage;