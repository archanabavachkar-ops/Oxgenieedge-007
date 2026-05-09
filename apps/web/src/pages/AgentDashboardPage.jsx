import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Inbox, CalendarClock, Flame, PhoneMissed } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import LeadCard from '@/components/LeadCard.jsx';
import TodayStatsSection from '@/components/TodayStatsSection.jsx';
import ScheduleFollowUpModal from '@/components/ScheduleFollowUpModal.jsx';
import AddNotesModal from '@/components/AddNotesModal.jsx';
import CallOutcomeModal from '@/components/CallOutcomeModal.jsx';
import SkeletonLoader from '@/components/SkeletonLoader.jsx';

export default function AgentDashboardPage() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [logCallModalOpen, setLogCallModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const records = await pb.collection('leads').getFullList({
        filter: `assignedTo = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setLeads(records);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentUser]);

  const handleSchedule = (lead) => {
    setSelectedLead(lead);
    setScheduleModalOpen(true);
  };

  const handleAddNotes = (lead) => {
    setSelectedLead(lead);
    setNotesModalOpen(true);
  };

  const handleLogCall = (lead) => {
    setSelectedLead(lead);
    setLogCallModalOpen(true);
  };

  const handleLeadUpdated = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  // Derived lists
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const newLeads = leads.filter(l => l.status === 'New Lead');
  
  const followUpsDue = leads.filter(l => {
    if (!l.nextFollowUpDate) return false;
    const followUpDate = new Date(l.nextFollowUpDate);
    return followUpDate <= today && l.status !== 'Won' && l.status !== 'Lost';
  });

  const highPriorityLeads = leads.filter(l => l.priority === 'Hot' && l.status !== 'Won' && l.status !== 'Lost');

  const missedCalls = leads.filter(l => {
    if (!l.lastContactDate) return false;
    const contactDate = new Date(l.lastContactDate);
    return contactDate < yesterday && l.status === 'Attempted Contact';
  });

  const renderLeadGrid = (leadList, emptyMessage) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonLoader key={i} className="h-[280px] rounded-xl" />)}
        </div>
      );
    }

    if (leadList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
          <Inbox className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">All caught up</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leadList.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onSchedule={handleSchedule}
            onAddNotes={handleAddNotes}
            onLogCall={handleLogCall}
          />
        ))}
      </div>
    );
  };

  return (
    <CRMLayout 
      title="Agent Dashboard" 
      breadcrumbs={[{label: 'CRM', path: '/admin/crm/dashboard'}, {label: 'Agent Dashboard'}]}
    >
      <Helmet>
        <title>{`Agent Dashboard | CRM`}</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Queue</h1>
          <p className="text-muted-foreground mt-2">Manage your assigned leads and daily tasks.</p>
        </div>

        <TodayStatsSection leads={leads} />

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto p-1 bg-muted/50">
            <TabsTrigger value="new" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                <span>New Leads</span>
                <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary hover:bg-primary/20">{newLeads.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="followups" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                <span>Follow-ups Due</span>
                <Badge variant="secondary" className="ml-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">{followUpsDue.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="priority" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>High Priority</span>
                <Badge variant="secondary" className="ml-1 bg-red-500/10 text-red-600 hover:bg-red-500/20">{highPriorityLeads.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="missed" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <PhoneMissed className="w-4 h-4" />
                <span>Missed Calls</span>
                <Badge variant="secondary" className="ml-1 bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">{missedCalls.length}</Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-0 outline-none">
            {renderLeadGrid(newLeads, "You don't have any new leads assigned to you right now.")}
          </TabsContent>
          
          <TabsContent value="followups" className="mt-0 outline-none">
            {renderLeadGrid(followUpsDue, "No follow-ups scheduled for today. Great job!")}
          </TabsContent>
          
          <TabsContent value="priority" className="mt-0 outline-none">
            {renderLeadGrid(highPriorityLeads, "No hot leads in your queue at the moment.")}
          </TabsContent>
          
          <TabsContent value="missed" className="mt-0 outline-none">
            {renderLeadGrid(missedCalls, "No stale attempted contacts. You're staying on top of your calls.")}
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleFollowUpModal 
        isOpen={scheduleModalOpen} 
        onClose={() => setScheduleModalOpen(false)} 
        lead={selectedLead}
        onScheduled={handleLeadUpdated}
      />
      
      <AddNotesModal 
        isOpen={notesModalOpen} 
        onClose={() => setNotesModalOpen(false)} 
        lead={selectedLead}
        onNotesAdded={handleLeadUpdated}
      />

      <CallOutcomeModal
        isOpen={logCallModalOpen}
        onClose={() => setLogCallModalOpen(false)}
        lead={selectedLead}
        onOutcomeSaved={handleLeadUpdated}
      />
    </CRMLayout>
  );
}