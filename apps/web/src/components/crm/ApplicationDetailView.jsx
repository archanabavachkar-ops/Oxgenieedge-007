import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Download, MessageSquare, Send, FileText, UserPlus, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const ApplicationDetailView = ({ application, onClose, onUpdate }) => {
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Attempt to fetch activity logs for this application
    const fetchActivities = async () => {
      try {
        const logs = await pb.collection('activity_logs').getFullList({
          filter: `entity_id = "${application.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setActivities(logs);
      } catch (err) {
        console.log('No activity logs found or error fetching:', err);
      }
    };
    fetchActivities();
  }, [application.id]);

  if (!application) return null;

  const logActivity = async (action, details) => {
    try {
      await pb.collection('activity_logs').create({
        entity_type: 'lead', // using lead as generic entity or custom if needed
        entity_id: application.id,
        action: action,
        changes: details,
        user_id: pb.authStore.model?.id
      }, { $autoCancel: false });
    } catch (e) {
      console.log('Failed to log activity', e);
    }
  };

  const handleStatusChange = async (newStatus, newRecommendation = null) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;
    
    try {
      setIsUpdating(true);
      const updateData = { status: newStatus };
      if (newRecommendation) {
        updateData.aiRecommendation = newRecommendation;
      }
      
      const updated = await pb.collection('partner_applications').update(application.id, updateData, { $autoCancel: false });
      await logActivity('updated', { field: 'status', to: newStatus });
      
      toast.success(`Application marked as ${newStatus}`);
      onUpdate(updated);
    } catch (error) {
      toast.error('Failed to update application');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      setIsUpdating(true);
      const newNote = {
        content: note,
        author: pb.authStore.model?.name || pb.authStore.model?.email || 'Admin',
        timestamp: new Date().toISOString()
      };
      const existingNotes = application.notes || [];
      const updated = await pb.collection('partner_applications').update(application.id, {
        notes: [...existingNotes, newNote]
      }, { $autoCancel: false });
      
      await logActivity('created', { type: 'note_added', content: note });
      
      setNote('');
      toast.success('Note added successfully');
      onUpdate(updated);
    } catch (error) {
      toast.error('Failed to add note');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignReviewer = async () => {
    const reviewer = window.prompt("Enter reviewer's name or email:");
    if (!reviewer) return;
    try {
      setIsUpdating(true);
      const updated = await pb.collection('partner_applications').update(application.id, {
        assignedReviewer: reviewer
      }, { $autoCancel: false });
      await logActivity('updated', { field: 'assignedReviewer', to: reviewer });
      toast.success(`Assigned to ${reviewer}`);
      onUpdate(updated);
    } catch (error) {
      toast.error('Failed to assign reviewer');
    } finally {
      setIsUpdating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-success bg-success/10 border-success/20';
    if (score >= 50) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const renderFileLink = (fieldName, label) => {
    const val = application[fieldName];
    if (!val) return null;

    const files = Array.isArray(val) ? val : [val];
    return files.map((file, i) => {
      // Determine URL. If it's a pocketbase file string, construct URL.
      // If it's a full URL (from external storage), just use it.
      const url = file.startsWith('http') ? file : pb.files.getUrl(application, file);
      const displayLabel = files.length > 1 ? `${label} ${i+1}` : label;
      
      return (
        <a 
          key={i} 
          href={url} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-primary transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium truncate text-foreground group-hover:text-primary">
              {displayLabel}
            </span>
          </div>
          <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </a>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-border overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-foreground">Application: {application.companyName || application.fullName}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                application.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                application.status === 'Rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
                {application.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              ID: {application.applicationId} • Submitted: {new Date(application.submittedDate || application.created).toLocaleString()} • Source: {application.source}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-input rounded-full transition-colors text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              
              <section className="bg-muted/10 p-5 rounded-xl border border-border/50">
                <h3 className="text-lg font-bold text-primary mb-4">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Full Name</label>
                    <p className="text-sm font-medium">{application.fullName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Company Name</label>
                    <p className="text-sm font-medium">{application.companyName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Email</label>
                    <a href={`mailto:${application.email}`} className="text-sm font-medium text-primary hover:underline">{application.email}</a>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Mobile</label>
                    <a href={`tel:${application.mobileNumber}`} className="text-sm font-medium text-primary hover:underline">{application.mobileNumber}</a>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Website</label>
                    {application.website ? (
                      <a href={application.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline block truncate">{application.website}</a>
                    ) : <p className="text-sm text-muted-foreground">-</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Location</label>
                    <p className="text-sm font-medium">{application.region}, {application.country}</p>
                  </div>
                </div>
              </section>

              <section className="bg-muted/10 p-5 rounded-xl border border-border/50">
                <h3 className="text-lg font-bold text-primary mb-4">Business Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-1">Business Type</label>
                    <div className="inline-block px-3 py-1 bg-input rounded text-sm font-medium border border-border/50">{application.businessType}</div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-1">Services Offered</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(application.servicesOffered || []).map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-1">Motivation (Why Partner?)</label>
                    <p className="text-sm bg-input p-4 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed">
                      {application.whyPartner}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-muted/10 p-5 rounded-xl border border-border/50">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Comments & Notes
                </h3>
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                  {(application.notes || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No internal notes.</p>
                  ) : (
                    (application.notes || []).map((n, idx) => (
                      <div key={idx} className="bg-input p-3 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-primary">{n.author}</span>
                          <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an internal note..." 
                    className="flex-1 bg-input border-border/50 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    disabled={isUpdating}
                  />
                  <button 
                    type="submit" 
                    disabled={isUpdating || !note.trim()}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Save
                  </button>
                </form>
              </section>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* AI Score */}
              <div className="bg-muted/10 rounded-xl p-5 border border-border/50">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> AI Analysis
                </h3>
                
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-2 ${getScoreColor(application.aiScore)}`}>
                    <span className="text-4xl font-black">{application.aiScore || 0}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Partner Score</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-input p-2 rounded border border-border/30">
                    <p className="text-xs text-muted-foreground">Recommendation</p>
                    <p className="text-sm font-bold">{application.aiRecommendation || 'Pending'}</p>
                  </div>
                  <div className="bg-input p-2 rounded border border-border/30">
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <p className={`text-sm font-bold ${application.riskLevel === 'Low' ? 'text-success' : application.riskLevel === 'High' ? 'text-destructive' : 'text-yellow-500'}`}>
                      {application.riskLevel || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-input p-2 rounded border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Auto Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {(application.autoTags || []).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-muted/10 rounded-xl p-5 border border-border/50">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents
                </h3>
                <div className="space-y-2">
                  {renderFileLink('gstCertificate', 'GST Certificate')}
                  {renderFileLink('panCertificate', 'PAN Certificate')}
                  {renderFileLink('certifications', 'Certification')}
                  {renderFileLink('portfolio', 'Portfolio')}
                  
                  {/* Fallback to documents JSON field if legacy structure */}
                  {application.documents && Object.keys(application.documents).length > 0 && 
                    Object.entries(application.documents).map(([key, url]) => (
                      <a key={key} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-primary transition-all">
                        <span className="text-sm font-medium">{key}</span>
                        <Download className="w-4 h-4 text-primary" />
                      </a>
                    ))
                  }
                  
                  {(!application.gstCertificate && !application.panCertificate && (!application.certifications || application.certifications.length===0) && (!application.portfolio || application.portfolio.length===0) && !application.documents) && (
                     <p className="text-sm text-muted-foreground text-center py-2">No documents attached.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-muted/10 rounded-xl p-5 border border-border/50">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Actions</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <span className="font-bold">{application.assignedReviewer || 'Unassigned'}</span>
                  </div>
                  <button onClick={handleAssignReviewer} disabled={isUpdating} className="w-full py-2 bg-input border border-border rounded-lg text-sm font-bold hover:border-primary transition-colors flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4"/> Assign Reviewer
                  </button>
                  <button onClick={() => handleStatusChange('Under Review')} disabled={isUpdating || application.status === 'Under Review'} className="w-full py-2 bg-input border border-border rounded-lg text-sm font-bold hover:border-primary transition-colors">
                    Request Documents / Review
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                  <button 
                    onClick={() => handleStatusChange('Approved', 'Approve')}
                    disabled={isUpdating || application.status === 'Approved'}
                    className="py-2.5 bg-success hover:bg-success/90 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange('Rejected', 'Reject')}
                    disabled={isUpdating || application.status === 'Rejected'}
                    className="py-2.5 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Activity Log Preview */}
              {activities.length > 0 && (
                <div className="bg-muted/10 rounded-xl p-5 border border-border/50 max-h-[200px] overflow-y-auto">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Activity Log
                  </h3>
                  <div className="space-y-3">
                    {activities.map(log => (
                      <div key={log.id} className="text-xs">
                        <span className="text-primary font-bold">{log.action}</span> 
                        <span className="text-muted-foreground"> by User {log.user_id?.substring(0,5)} • {new Date(log.created).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailView;