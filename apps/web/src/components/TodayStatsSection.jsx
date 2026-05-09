import React from 'react';
import { Users, PhoneOutgoing, Target, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TodayStatsSection({ leads }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalAssigned = leads.length;
  
  const contactedToday = leads.filter(lead => {
    if (!lead.lastContactDate) return false;
    const contactDate = new Date(lead.lastContactDate);
    return contactDate >= today;
  }).length;

  const wonLeads = leads.filter(lead => lead.status === 'Won').length;
  const conversionRate = totalAssigned > 0 ? Math.round((wonLeads / totalAssigned) * 100) : 0;

  const followUpsToday = leads.filter(lead => {
    if (!lead.nextFollowUpDate) return false;
    const followUpDate = new Date(lead.nextFollowUpDate);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return followUpDate >= today && followUpDate < tomorrow;
  }).length;

  const stats = [
    {
      title: 'Total Assigned',
      value: totalAssigned,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Contacted Today',
      value: contactedToday,
      icon: PhoneOutgoing,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Follow-ups Today',
      value: followUpsToday,
      icon: CalendarCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h4 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h4>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}