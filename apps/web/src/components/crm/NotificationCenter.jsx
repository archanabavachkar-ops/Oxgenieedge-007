import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, MessageSquare, ListTodo, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
      // Simple polling for real-time feel
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await apiServerClient.fetch(`/notifications/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
        setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read_at).length : 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await apiServerClient.fetch(`/notifications/${id}/read`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      
      // Mark all in background
      Promise.all(unreadIds.map(id => 
        apiServerClient.fetch(`/notifications/${id}/read`, { method: 'POST' })
      ));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'task_assigned': return <ListTodo className="w-4 h-4 text-blue-500" />;
      case 'task_due': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'task_overdue': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'mention': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:text-primary/80">
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notif.read_at ? 'bg-primary/5' : ''}`}
                  onClick={() => !notif.read_at && markAsRead(notif.id)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read_at ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at || notif.created), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read_at && (
                    <div className="flex-shrink-0 self-center">
                      <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border bg-muted/30 text-center">
          <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
            Notification Preferences
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;