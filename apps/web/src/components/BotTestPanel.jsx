import React, { useState } from 'react';
import { Beaker, Play, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { detectIntent, getDefaultResponse } from '@/utils/intentDetector.js';

export default function BotTestPanel({ templates = [] }) {
  const [testInput, setTestInput] = useState('');
  const [result, setResult] = useState(null);

  const handleTest = (e) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const { intent, confidence } = detectIntent(testInput, templates);
    const response = getDefaultResponse(intent, templates);

    setResult({
      input: testInput,
      intent,
      confidence,
      response
    });
    
    setTestInput('');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="h-5 w-5 text-primary" />
          Intent Testing
        </CardTitle>
        <CardDescription>Test how the bot interprets different phrases</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleTest} className="flex gap-2">
          <Input
            placeholder="Type a test phrase (e.g., 'how much does it cost?')"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!testInput.trim()}>
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </form>

        {result && (
          <div className="bg-muted/30 rounded-lg p-4 border space-y-3 animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Input</p>
                <p className="text-sm font-medium">"{result.input}"</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Detected Intent</p>
                <div className="flex items-center gap-2 justify-end">
                  <Badge variant={result.intent === 'unknown' ? 'secondary' : 'default'}>
                    {result.intent}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bot Response</p>
              <p className="text-sm text-foreground bg-background p-3 rounded-md border shadow-sm">
                {result.response}
              </p>
            </div>

            {result.intent === 'unknown' && (
              <div className="flex items-center gap-2 text-xs text-warning-foreground bg-warning/10 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                Consider adding a template for this phrase if it's common.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}