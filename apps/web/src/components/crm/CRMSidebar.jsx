import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, BarChart3, ShieldAlert, Workflow, Users, Target, PhoneCall, Settings, X, LineChart, Lightbulb, MessageCircle, MessageSquare, GitMerge, FileText, Contact2, KeyRound as UsersRound, Plug, UserCog, CreditCard, ChevronDown, ChevronRight, Layers, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';

const NAV_SECTIONS = [
  {
    id: 'revenue',
    title: 'Revenue & Analytics',
    icon: LineChart,
    items: [
      { label: 'Dashboard', path: '/admin/crm/dashboard', icon: LayoutDashboard },
      { label: 'Bot Analytics', path: '/admin/crm/bot-analytics', icon: BarChart3, badge: 'new' },
      { label: 'Reports', path: '/admin/crm/reports', icon: FileText },
      { label: 'Insights', path: '/admin/crm/insights', icon: Lightbulb },
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: Layers,
    items: [
      { label: 'Conversations', path: '/admin/crm/conversations', icon: MessageCircle },
      { label: 'Calls', path: '/admin/crm/calls', icon: PhoneCall, badge: 'new' },
      { label: 'Messages', path: '/admin/crm/messages', icon: MessageSquare },
      { label: 'Escalations', path: '/admin/crm/escalations', icon: ShieldAlert, badge: 'new' },
    ]
  },
  {
    id: 'automation',
    title: 'Automation & Bot',
    icon: Bot,
    items: [
      { label: 'Bot Engine', path: '/admin/crm/bot-engine', icon: Bot, badge: 'new' },
      { label: 'Automations', path: '/admin/crm/automations', icon: Workflow, badge: 'new' },
      { label: 'Workflows', path: '/admin/crm/workflows', icon: GitMerge },
      { label: 'Templates', path: '/admin/crm/templates', icon: FileText },
    ]
  },
  {
    id: 'people',
    title: 'People & Leads',
    icon: Users,
    items: [
      { label: 'Agents', path: '/admin/crm/agents', icon: Contact2, badge: 'new' },
      { label: 'Agent Performance', path: '/admin/crm/agent-performance', icon: TrendingUp, badge: 'new' },
      { label: 'Leads', path: '/admin/crm/leads', icon: Target, badge: 'new' },
      { label: 'Contacts', path: '/admin/crm/contacts', icon: UsersRound },
      { label: 'Teams', path: '/admin/crm/teams', icon: Users },
    ]
  },
  {
    id: 'config',
    title: 'Configuration',
    icon: Settings,
    items: [
      { label: 'Settings', path: '/admin/crm/settings', icon: Settings, badge: 'new' },
      { label: 'Integrations', path: '/admin/crm/integrations', icon: Plug },
      { label: 'Users', path: '/admin/crm/users', icon: UserCog },
      { label: 'Billing', path: '/admin/crm/billing', icon: CreditCard },
    ]
  }
];

export default function CRMSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    revenue: true,
    operations: true,
    automation: true,
    people: true,
    config: false
  });

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800/60 shrink-0">
          <Link to="/admin/crm/dashboard" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span>AI Call Centre</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800 -mr-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 custom-scrollbar">
          {NAV_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors group uppercase tracking-wider rounded-lg hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {section.title}
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isExpanded ? "rotate-0" : "-rotate-90"
                    )} 
                  />
                </button>
                
                <div 
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ml-1.5",
                            isActive 
                              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20" 
                              : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                            )} />
                            {item.label}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.badge === 'new' && (
                              <span className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                                isActive 
                                  ? "bg-white/20 text-white" 
                                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              )}>
                                New
                              </span>
                            )}
                            {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-1">System Status</p>
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}