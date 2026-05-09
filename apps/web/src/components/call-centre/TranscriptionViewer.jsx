import React, { useState } from 'react';
import { Search, Copy, Download, FileText, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TranscriptionViewer = ({ transcriptionText = '', confidence = 0, recordingId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Parse text into pseudo-paragraphs with timestamps for realism
  const parseTranscription = (text) => {
    if (!text) return [];
    // Mock parsing: split by sentences and add fake timestamps
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    let timeAcc = 0;
    
    return sentences.map((sentence, idx) => {
      const startStr = `${Math.floor(timeAcc / 60).toString().padStart(2,'0')}:${Math.floor(timeAcc % 60).toString().padStart(2,'0')}`;
      timeAcc += Math.random() * 5 + 3; // Add 3-8 seconds
      
      return {
        id: idx,
        timestamp: startStr,
        speaker: idx % 2 === 0 ? 'Agent' : 'Customer',
        text: sentence.trim()
      };
    });
  };

  const segments = parseTranscription(transcriptionText);

  // Highlight search term
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <mark key={i} className="bg-primary/20 text-primary rounded-sm px-1">{part}</mark> : 
            part
        )}
      </>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcriptionText);
    setCopied(true);
    toast.success('Transcription copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    toast.success('Exporting PDF...', { description: 'The file will download shortly.' });
    // Implementation would go here (e.g. jspdf)
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm">
      <CardHeader className="p-4 border-b bg-muted/10 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transcription
            </CardTitle>
            {confidence > 0 && (
              <Badge variant={confidence > 0.8 ? "secondary" : "outline"} className="font-mono text-xs">
                {Math.round(confidence * 100)}% Confidence
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transcript..." 
                className="h-8 pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy text">
              {copied ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExportPdf} title="Export PDF">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0">
        {!transcriptionText ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No transcription available.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {segments.map((segment) => (
              <div key={segment.id} className="flex gap-3 text-sm group">
                <div className="w-12 shrink-0 pt-0.5">
                  <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {segment.timestamp}
                  </span>
                </div>
                <div className="flex-1">
                  <span className={`font-semibold mr-2 ${segment.speaker === 'Agent' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {segment.speaker}:
                  </span>
                  <span className="leading-relaxed text-foreground">
                    {highlightText(segment.text, searchTerm)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptionViewer;