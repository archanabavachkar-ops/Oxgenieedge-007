import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const IntegrationCard = ({ name, description, features = [], onSetup, icon: Icon, accentColor = 'text-primary' }) => {
  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-border bg-[hsl(var(--integration-card-bg))] hover:bg-[hsl(var(--integration-card-hover))]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4 mb-3">
          {Icon && (
            <div className={`p-3 rounded-xl bg-muted ${accentColor}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto pt-6 border-t border-border/50">
        <Button onClick={onSetup} className="w-full group" variant="outline">
          <span>Setup Integration</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;