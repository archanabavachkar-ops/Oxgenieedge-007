
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import ActivityIcon from './ActivityIcon.jsx';

const ActivityTimeline = ({ activities = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-16 w-full mt-2" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-muted/10">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No activities found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          There are no recorded activities matching your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
      {activities.map((activity) => {
        const lead = activity.expand?.leadId;
        const user = activity.expand?.userId;
        const date = new Date(activity.createdAt || activity.created);
        
        return (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Timeline Node */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
              <ActivityIcon eventType={activity.eventType} className="w-full h-full" />
            </div>
            
            {/* Content Card */}
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow border-border/50">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{activity.eventType}</span>
                      {activity.source && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground uppercase tracking-wider">
                          {activity.source}
                        </span>
                      )}
                    </div>
                    {lead && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Lead: <span className="font-medium text-foreground">{lead.name || lead.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap text-right">
                    <div className="font-medium text-foreground/80">
                      {formatDistanceToNow(date, { addSuffix: true })}
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {format(date, 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm bg-muted/30 p-3 rounded-md border border-border/50 text-foreground/90">
                  {activity.description || 'No additional details provided.'}
                </div>
                
                {user && (
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-[10px]">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    Action by <span className="font-medium text-foreground">{user.name || user.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
