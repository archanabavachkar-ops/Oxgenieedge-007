import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Calendar, Clock, FileText, PhoneCall, ChevronRight, PhoneOutgoing } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LeadCard({ lead, onSchedule, onAddNotes, onLogCall }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Hot': return 'bg-priority-hot hover:bg-priority-hot/90';
      case 'Medium': return 'bg-priority-medium hover:bg-priority-medium/90';
      case 'Cold': return 'bg-priority-cold hover:bg-priority-cold/90';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Card className="flex flex-col h-full card-elevation card-elevation-hover overflow-hidden">
      <CardContent className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{lead.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="w-3.5 h-3.5 mr-1.5" />
              {lead.mobile || 'No phone'}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <span className="line-clamp-1">{lead.email || 'No email'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="font-medium">
              {lead.status}
            </Badge>
            <Badge className={`${getPriorityColor(lead.priority)} border-none`}>
              {lead.priority}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Last Contact
            </span>
            <span className="font-medium text-foreground">{formatDate(lead.lastContactDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Next Follow-up
            </span>
            <span className="font-medium text-foreground">{formatDate(lead.nextFollowUpDate)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-muted/30 border-t border-border flex flex-col gap-2 mt-auto">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button size="sm" variant="default" asChild>
            <a href={`tel:${lead.mobile}`}>
              <PhoneCall className="w-4 h-4 mr-2" /> Call
            </a>
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onLogCall(lead)}>
            <PhoneOutgoing className="w-4 h-4 mr-2" /> Log Call
          </Button>
          <Button size="sm" variant="outline" onClick={() => onSchedule(lead)}>
            <Calendar className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddNotes(lead)}>
            <FileText className="w-4 h-4 mr-2" /> Notes
          </Button>
        </div>
        <Button size="sm" variant="ghost" className="w-full mt-1" asChild>
          <Link to={`/admin/crm/leads/${lead.id}`}>
            View Details <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}