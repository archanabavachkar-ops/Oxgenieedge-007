import React, { useState } from 'react';
import { Bot, Settings, Activity } from 'lucide-react';
import BotTemplateManager from '@/components/BotTemplateManager.jsx';
import BotTestPanel from '@/components/BotTestPanel.jsx';
import BotChatWidget from '@/components/BotChatWidget.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

export default function BotEnginePage() {
  const [activeTemplates, setActiveTemplates] = useState([]);

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bot Engine</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Configure intent detection, manage response templates, and test your AI assistant's behavior in real-time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Configuration & Testing */}
          <div className="lg:col-span-2 space-y-8">
            <BotTestPanel templates={activeTemplates} />
            <BotTemplateManager onTemplatesChange={setActiveTemplates} />
          </div>

          {/* Right Column: Status & Info */}
          <div className="space-y-8">
            <Card className="shadow-sm border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Engine Status</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Templates</span>
                    <span className="text-sm font-medium">{activeTemplates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Detection Model</span>
                    <span className="text-sm font-medium">Keyword + Heuristics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">How it works</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    1. The engine analyzes incoming messages against your defined <strong>keywords</strong>.
                  </p>
                  <p>
                    2. It calculates a <strong>confidence score</strong> based on keyword matches and message length.
                  </p>
                  <p>
                    3. If the score exceeds the threshold, it triggers the corresponding <strong>intent</strong> and sends the template response.
                  </p>
                  <p>
                    4. Unmatched messages fall back to the <strong>unknown</strong> intent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Floating Chat Widget for live testing */}
      <BotChatWidget templates={activeTemplates} />
    </div>
  );
}