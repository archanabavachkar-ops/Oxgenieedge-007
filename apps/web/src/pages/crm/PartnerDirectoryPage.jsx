import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Briefcase, MapPin, Mail, ExternalLink, MoreHorizontal, UserX } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import CrmLayout from '@/components/CrmLayout.jsx';
import { toast } from 'sonner';

const PartnerDirectoryPage = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      // Fetch only approved partners to display in directory
      const records = await pb.collection('partner_applications').getFullList({
        filter: 'status = "Approved"',
        sort: '-updated',
        $autoCancel: false
      });
      setPartners(records);
    } catch (error) {
      console.error('Error fetching directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleDeactivate = async (id) => {
    if(!window.confirm('Are you sure you want to deactivate this partner?')) return;
    try {
      await pb.collection('partner_applications').update(id, {
        status: 'Rejected' // Or a specific 'Inactive' status if added to schema later
      }, { $autoCancel: false });
      toast.success('Partner deactivated');
      setPartners(partners.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to deactivate partner');
      console.error(error);
    }
  };

  const filteredPartners = partners.filter(p => 
    (p.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <CrmLayout title="Partner Directory">
      <Helmet><title>Partner Directory | OxgenieEdge CRM</title></Helmet>

      <div className="mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by partner or company name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-accent/50 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            Loading directory...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-accent/20 rounded-2xl">
            No approved partners found.
          </div>
        ) : (
          filteredPartners.map(partner => (
            <div key={partner.id} className="bg-card border border-accent/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                    {(partner.company_name || partner.full_name).charAt(0)}
                  </div>
                  <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-500/20">
                    Active
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                  {partner.company_name || partner.full_name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{partner.business_type}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-foreground/80 gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{partner.geographic_region || 'Unknown Region'}</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground/80 gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{(partner.services_offered || []).join(', ') || 'No specific services'}</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground/80 gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border-t border-accent/20 p-4 flex items-center justify-between">
                {partner.website_url ? (
                  <a href={partner.website_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">No website</span>
                )}
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleDeactivate(partner.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Deactivate Partner"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="More Options">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CrmLayout>
  );
};

export default PartnerDirectoryPage;