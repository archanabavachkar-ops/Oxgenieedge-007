
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import CrmLayout from '@/layouts/CRMLayout.jsx';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STAGES = ['New Lead', 'Connected', 'Qualified', 'Proposal Sent', 'Won'];

const PipelinePage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const records = await pb.collection('leads').getFullList({ $autoCancel: false });
      setLeads(records);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDragStart = (e, leadId) => { e.dataTransfer.setData('leadId', leadId); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await pb.collection('leads').update(leadId, { status: newStatus }, { $autoCancel: false });
      toast.success(`Moved to ${newStatus}`);
    } catch (error) { fetchLeads(); }
  };

  return (
    <CrmLayout title="Sales Pipeline" description="Visual overview of your active deals and leads.">
      <Helmet><title>Pipeline - CRM</title></Helmet>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#FF6B00] font-bold">Loading pipeline...</div>
      ) : (
        <div className="flex overflow-x-auto pb-8 gap-6 min-h-[calc(100vh-16rem)] hide-scrollbar">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(l => (l.status === stage) || (stage === 'New Lead' && !l.status));
            
            return (
              <div 
                key={stage} 
                className="flex-shrink-0 w-80 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col border border-[#E2E8F0]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="font-heading font-bold text-[#0F172A]">{stage}</h3>
                  <Badge variant="secondary" className="bg-white text-[#FF6B00] border-[#E2E8F0] font-numbers font-bold shadow-sm">{stageLeads.length}</Badge>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto hide-scrollbar">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-5 rounded-[16px] shadow-premium-card border border-[#E2E8F0] cursor-grab hover:border-[#FF6B00] active:cursor-grabbing hover-lift transition-all"
                    >
                      <h4 className="font-bold text-[#0F172A] mb-1">{lead.name}</h4>
                      <p className="text-xs font-semibold text-[#64748B] mb-4 truncate">{lead.email}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#94A3B8] font-numbers">{new Date(lead.created).toLocaleDateString()}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded-[6px]">
                          {lead.source || 'Direct'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-[#E2E8F0] rounded-[16px] flex items-center justify-center text-sm font-bold text-[#94A3B8]">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CrmLayout>
  );
};

export default PipelinePage;
