import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, Eye, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import CrmLayout from '@/components/CrmLayout.jsx';
import ApplicationDetailView from '@/components/crm/ApplicationDetailView.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const PartnerApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState('-submittedDate');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build filter string
      const filters = [];
      if (searchTerm) {
        filters.push(`(fullName ~ "${searchTerm}" || companyName ~ "${searchTerm}" || email ~ "${searchTerm}")`);
      }
      if (statusFilter) filters.push(`status = "${statusFilter}"`);
      if (businessTypeFilter) filters.push(`businessType = "${businessTypeFilter}"`);
      if (regionFilter) filters.push(`region = "${regionFilter}"`);
      
      if (scoreFilter) {
        const [min, max] = scoreFilter.split('-');
        filters.push(`aiScore >= ${min} && aiScore <= ${max}`);
      }

      const filterStr = filters.join(' && ');

      const result = await pb.collection('partner_applications').getList(page, 10, {
        sort: sortBy,
        filter: filterStr,
        $autoCancel: false
      });

      setApplications(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // Real-time updates logic omitted for strict pagination sync, 
    // but typically you'd refresh on event or update local state carefully.
  }, [page, sortBy, statusFilter, scoreFilter, businessTypeFilter, regionFilter, searchTerm]);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-success bg-success/10 border-success/20';
    if (score >= 50) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const getStatusBadge = (status) => {
    const map = {
      'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Approved': 'bg-success/10 text-success border-success/20',
      'Rejected': 'bg-destructive/10 text-destructive border-destructive/20'
    };
    const style = map[status] || 'bg-muted/30 text-muted-foreground border-border/50';
    return <span className={`px-2.5 py-1 text-xs font-bold rounded border ${style}`}>{status}</span>;
  };

  return (
    <CrmLayout title="Partner Applications">
      <Helmet><title>Partner Applications | OxgenieEdge CRM</title></Helmet>

      {/* Toolbar & Filters */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none min-w-[120px]">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={scoreFilter} onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none min-w-[120px]">
              <option value="">All Scores</option>
              <option value="75-100">75 - 100 (High)</option>
              <option value="50-74">50 - 74 (Medium)</option>
              <option value="0-49">0 - 49 (Low)</option>
            </select>
            <select value={businessTypeFilter} onChange={(e) => { setBusinessTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none min-w-[130px]">
              <option value="">All Business Types</option>
              <option value="Agency">Agency</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Reseller">Reseller</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <select value={regionFilter} onChange={(e) => { setRegionFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none min-w-[120px]">
              <option value="">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
            </select>
            <button onClick={fetchApplications} className="p-2 bg-input border border-border rounded-lg hover:border-primary transition-colors text-muted-foreground" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button onClick={fetchApplications} className="px-4 py-1.5 bg-destructive text-white text-sm font-bold rounded-lg">Retry</button>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/20 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === 'applicationId' ? '-applicationId' : 'applicationId')}>Application ID</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === 'fullName' ? '-fullName' : 'fullName')}>Applicant</th>
                <th className="px-6 py-4 font-bold">Company</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === 'businessType' ? '-businessType' : 'businessType')}>Type</th>
                <th className="px-6 py-4 font-bold text-center cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === 'aiScore' ? '-aiScore' : 'aiScore')}>AI Score</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === 'status' ? '-status' : 'status')}>Status</th>
                <th className="px-6 py-4 font-bold cursor-pointer hover:text-primary" onClick={() => setSortBy(sortBy === '-submittedDate' ? 'submittedDate' : '-submittedDate')}>Submitted</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-input" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32 bg-input" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28 bg-input" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20 bg-input" /></td>
                    <td className="px-6 py-4 flex justify-center"><Skeleton className="h-8 w-8 rounded-full bg-input" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded bg-input" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-input" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded bg-input ml-auto" /></td>
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-muted-foreground">
                    <p className="text-lg font-bold text-foreground mb-1">No applications found</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-input/50 transition-colors group cursor-pointer" 
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-muted-foreground">{app.applicationId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{app.fullName}</span>
                        <span className="text-xs text-muted-foreground">{app.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{app.companyName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{app.businessType}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold text-xs ${getScoreColor(app.aiScore)}`}>
                        {app.aiScore || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.submittedDate || app.created).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        className="p-2 bg-input border border-border/50 rounded text-muted-foreground hover:text-primary hover:border-primary transition-all inline-flex shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-input border border-border rounded text-sm disabled:opacity-50 hover:border-primary transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-input border border-border rounded text-sm disabled:opacity-50 hover:border-primary transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedApp && (
        <ApplicationDetailView 
          application={selectedApp} 
          onClose={() => setSelectedApp(null)}
          onUpdate={(updated) => {
            setApplications(apps => apps.map(a => a.id === updated.id ? updated : a));
            setSelectedApp(updated);
          }}
        />
      )}
    </CrmLayout>
  );
};

export default PartnerApplicationsPage;