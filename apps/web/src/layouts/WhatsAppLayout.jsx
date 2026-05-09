import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { MessageSquare, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import WhatsAppStatusIndicator from '@/components/WhatsAppStatusIndicator.jsx';
import { useAutoLeadCreation } from '@/hooks/useAutoLeadCreation.js';

export default function WhatsAppLayout() {
  const location = useLocation();
  // Initialize the hook here so it runs globally while in the WhatsApp section
  useAutoLeadCreation();

  const navItems = [
    { name: 'Leads Dashboard', path: '/whatsapp-leads', icon: Users },
    { name: 'Settings', path: '/whatsapp-settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-lg">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            <span>WhatsApp</span>
          </div>
          <WhatsAppStatusIndicator />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#25D366]/10 text-[#25D366]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-card">
           <div className="flex items-center gap-2 text-primary font-semibold text-lg">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            <span>WhatsApp</span>
          </div>
          <WhatsAppStatusIndicator />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}