
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare, Phone, Map, Target,
  Zap, Bell, Settings, PieChart, Workflow, FileText, Plug
} from 'lucide-react';
import { cn } from '@/lib/utils.js';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/crm/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Sales & Growth',
    items: [
      { name: 'Leads', path: '/admin/crm/leads', icon: Target },
      { name: 'Pipeline/Deals', path: '/admin/crm/pipeline', icon: Map },
      { name: 'Contacts', path: '/admin/crm/contacts', icon: Users },
      { name: 'Campaigns', path: '/admin/crm/campaigns', icon: Workflow },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Lead Scoring', path: '/admin/crm/scoring', icon: PieChart },
      { name: 'AI Insights', path: '/admin/crm/insights', icon: Zap },
      { name: 'Reports', path: '/admin/crm/reports', icon: FileText },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Automations', path: '/admin/crm/automations', icon: Zap },
      { name: 'Tasks', path: '/admin/crm/tasks', icon: UserSquare },
      { name: 'Activities', path: '/admin/crm/activities', icon: Phone },
      { name: 'Notifications', path: '/admin/crm/notifications', icon: Bell },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Integrations', path: '/admin/crm/integrations', icon: Plug },
      { name: 'Settings', path: '/admin/crm/settings', icon: Settings },
    ]
  }
];

const CrmSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none text-white border-r border-[#1E293B]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center px-8 border-b border-[#1E293B]">
          <Link to="/admin/crm/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-primary flex items-center justify-center text-white font-heading font-bold text-xl shadow-glow-orange transition-transform duration-300 group-hover:scale-105">
              O
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">Oxgenie<span className="text-[#FF6B00]">Edge</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-thin scrollbar-thumb-[#1E293B] hover:scrollbar-thumb-[#334155]">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4 px-4 font-heading">
                {group.title}
              </h4>
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name} className="relative">
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#FF6B00] rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.5)]"></div>
                      )}
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold transition-all duration-300 mx-2",
                          isActive 
                            ? "bg-[rgba(255,107,0,0.12)] text-[#FF6B00]" 
                            : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white active:scale-[0.98]"
                        )}
                        onClick={() => onClose && onClose()}
                      >
                        <Icon className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-[#FF6B00]" : "text-[#64748B] group-hover:text-white")} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default CrmSidebar;
