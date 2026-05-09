import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Loader2, Mail, Phone, Globe, Building2, UserCircle, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import apiServerClient from '@/lib/apiServerClient.js';

const STATUS_COLORS = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Approved': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
};

export default function ApplicationDetailModal({ isOpen, onClose, applicationId, crmUsers, onAction }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Note state is handled purely visually here, if it needs saving we'd add an endpoint, 
  // but per prompt requirements, notes is an editable textarea. We won't persist it unless requested, 
  // or we'll just keep it purely visual for this modal implementation.
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicationId]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiServerClient.fetch(`/applications/${applicationId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch details');
      
      setApplication(data);
      setNotes(data.notes || '');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>Close</Button>
          </div>
        ) : application ? (
          <>
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <DialogTitle className="text-2xl font-bold">{application.fullName}</DialogTitle>
                    <Badge variant="outline" className={`${STATUS_COLORS[application.status] || STATUS_COLORS['New']} border`}>
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{application.applicationId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Submission Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {application.createdDate ? format(new Date(application.createdDate), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-xl border border-border">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center"><Mail className="w-3 h-3 mr-1"/> Email</p>
                    <p className="font-medium text-foreground">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center"><Phone className="w-3 h-3 mr-1"/> Phone</p>
                    <p className="font-medium text-foreground">{application.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center"><Building2 className="w-3 h-3 mr-1"/> Company</p>
                    <p className="font-medium text-foreground">{application.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center"><Globe className="w-3 h-3 mr-1"/> Website</p>
                    <p className="font-medium text-foreground">
                      {application.website ? (
                        <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {application.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Business Information</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Business Type</p>
                  <p className="text-sm font-medium">{application.businessType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description / Motivation</p>
                  <p className="text-sm bg-background p-4 rounded-lg border border-border leading-relaxed">
                    {application.businessDescription || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Account Manager & Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <UserCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Internal Details</h3>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Manager</p>
                  <p className="text-sm font-medium">
                    {application.accountManager 
                      ? crmUsers.find(u => u.id === application.accountManager)?.fullName || application.accountManager 
                      : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Internal Notes</p>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes here... (Not saved automatically in this view)"
                    className="min-h-[100px] bg-background border-border"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-border bg-card flex-col sm:flex-row gap-2 sm:gap-0 sticky bottom-0 z-10">
              <div className="flex w-full sm:w-auto">
                <Button 
                  className="w-full sm:w-auto bg-[#EF4444] text-white hover:bg-[#DC2626]" 
                  onClick={() => onAction('delete', application)}
                >
                  Delete
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto flex-wrap sm:flex-nowrap justify-end">
                <Button 
                  className="bg-[#6B7280] text-white hover:bg-[#4B5563]" 
                  onClick={onClose}
                >
                  Close
                </Button>
                
                {application.status === 'Approved' ? (
                  <Button 
                    className="bg-[#F97316] text-white hover:bg-[#EA580C]" 
                    onClick={() => onAction('assign', application)}
                  >
                    Assign Manager
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="bg-[#EF4444] text-white hover:bg-[#DC2626]" 
                      onClick={() => onAction('reject', application)}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-[#10B981] text-white hover:bg-[#059669]" 
                      onClick={() => onAction('approve', application)}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}