
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Mail, 
  LogOut, 
  X,
  BarChart3,
  TrendingUp,
  Briefcase,
  CheckSquare,
  MessageSquare,
  FileText,
  Zap,
  Award,
  AlertTriangle,
  Workflow,
  Target,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCrmOpen, setIsCrmOpen] = useState(true);

  const mainNavItems = [
    { name: 'Admin Home', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
  ];

  const crmNavItems = [
    { name: 'Dashboard', path: '/admin/crm/dashboard', icon: BarChart3 },
    { name: 'Leads', path: '/admin/crm/leads', icon: TrendingUp },
    { name: 'Contacts', path: '/admin/crm/contacts', icon: Users },
    { name: 'Customers', path: '/admin/crm/customers', icon: Users },
    { name: 'Deals', path: '/admin/crm/deals', icon: Briefcase },
    { name: 'Tasks', path: '/admin/crm/tasks', icon: CheckSquare },
    { name: 'Interactions', path: '/admin/crm/interactions', icon: MessageSquare },
    { name: 'Reports', path: '/admin/crm/reports', icon: FileText },
    { name: 'Integrations', path: '/admin/crm/integrations', icon: Zap },
    { name: 'Agent Performance', path: '/admin/crm/agents', icon: Award },
    { name: 'Escalations', path: '/admin/crm/escalations', icon: AlertTriangle },
    { name: 'Automations', path: '/admin/crm/automations', icon: Workflow },
    { name: 'Scoring', path: '/admin/crm/scoring', icon: Target },
    { name: 'Notifications', path: '/admin/crm/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/crm/settings', icon: Settings },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col shadow-lg lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-muted/30">
          <span className="text-xl font-bold text-primary tracking-tight">Admin Portal</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          
          {/* Main Admin Section */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System
            </p>
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* CRM Section */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsCrmOpen(!isCrmOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>CRM Suite</span>
              {isCrmOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            <div className={cn(
              "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
              isCrmOpen ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"
            )}>
              {crmNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-border bg-muted/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => logoutAdmin()}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
