import React from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Settings, Plug, Clock, Facebook, MessageCircle, Mail, PhoneCall, CreditCard, Target } from 'lucide-react';

const iconMap = {
  Facebook: Facebook,
  WhatsApp: MessageCircle,
  Email: Mail,
  Calls: PhoneCall,
  Stripe: CreditCard,
  GoogleAds: Target,
};

const IntegrationCard = ({
  integrationName,
  description,
  iconName,
  category,
  status,
  onConnect,
  onManage,
}) => {
  const IconComponent = iconMap[iconName] || Plug;

  const getStatusConfig = () => {
    switch (status) {
      case 'Connected':
        return {
          badgeClass: 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.25)]',
          badgeText: 'Connected',
          buttonText: 'Manage',
          ButtonIcon: Settings,
          action: onManage,
          disabled: false,
          variant: 'secondary'
        };
      case 'Coming Soon':
        return {
          badgeClass: 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning)/0.25)]',
          badgeText: 'Coming Soon',
          buttonText: 'Coming Soon',
          ButtonIcon: Clock,
          action: () => {},
          disabled: true,
          variant: 'outline'
        };
      case 'Disconnected':
      default:
        return {
          badgeClass: 'bg-muted text-muted-foreground hover:bg-muted/80',
          badgeText: 'Disconnected',
          buttonText: 'Connect',
          ButtonIcon: Plug,
          action: onConnect,
          disabled: false,
          variant: 'default'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="integration-card flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <IconComponent className="w-6 h-6" />
        </div>
        <Badge variant="outline" className={`${config.badgeClass} border-transparent badge-text`}>
          {config.badgeText}
        </Badge>
      </div>

      <div className="mb-2">
        <h3 className="card-title text-foreground">{integrationName}</h3>
        <p className="text-[12px] font-medium text-muted-foreground mb-3">{category}</p>
      </div>
      
      <p className="card-desc flex-grow">
        {description}
      </p>

      <div className="mt-6 pt-4 border-t border-border/50">
        <Button 
          variant={config.variant} 
          className="w-full justify-center transition-all duration-200 active:scale-[0.98]"
          disabled={config.disabled}
          onClick={config.action}
        >
          <config.ButtonIcon className="w-4 h-4 mr-2" />
          {config.buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default IntegrationCard;