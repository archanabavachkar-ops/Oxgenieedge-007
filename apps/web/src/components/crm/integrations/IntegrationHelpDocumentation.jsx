import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { integrationConfigs } from '@/config/integrationConfigs.js';
import { AlertCircle, HelpCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';

const IntegrationHelpDocumentation = ({ slug }) => {
  const config = integrationConfigs[slug];

  if (!config) {
    return <Alert><AlertCircle className="w-4 h-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Documentation not found for this integration.</AlertDescription></Alert>;
  }

  const { helpContent } = config;

  return (
    <div className="space-y-8 max-w-3xl">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" /> Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {helpContent.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="pt-1">
                  <p className="font-medium text-foreground">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="troubleshooting" className="border rounded-xl bg-card px-4">
          <AccordionTrigger className="hover:no-underline font-semibold text-lg">
            <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-warning" /> Troubleshooting</div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3 pt-2 pb-4">
            {helpContent.troubleshooting.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq" className="border rounded-xl bg-card px-4">
          <AccordionTrigger className="hover:no-underline font-semibold text-lg">
            <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-500" /> Frequently Asked Questions</div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4 pt-2 pb-4">
            {helpContent.faq.map((item, idx) => {
              const [q, a] = item.split('?');
              return (
                <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold text-foreground mb-1">{q}?</p>
                  <p>{a}</p>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default IntegrationHelpDocumentation;