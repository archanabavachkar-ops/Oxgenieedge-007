import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Building, Briefcase, Calendar, 
  Clock, CheckCircle, XCircle, FileText, MessageSquare, 
  Activity, Settings, Lock, LogOut, Loader2, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

export default function PartnerDashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [partner, setPartner] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('partnerToken');
        if (!token) throw new Error("No authentication token found");

        const [partnerRes, activityRes] = await Promise.all([
          apiServerClient.fetch('/partners/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiServerClient.fetch('/partners/activity?limit=10', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const partnerData = await partnerRes.json();
        const activityData = await activityRes.json();

        if (!partnerRes.ok || !partnerData.success) {
          throw new Error(partnerData.error || 'Failed to load profile');
        }

        setPartner(partnerData.partner);
        if (activityData.success) {
          setActivities(activityData.activities || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout('/partners/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const isStatusActive = partner?.status?.toLowerCase() === 'active';

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937]">
      <Helmet><title>Partner Dashboard | OxgenieEdge</title></Helmet>
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Partner Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, manage your partner profile and activities.</p>
          </div>
        </div>

        {error ? (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-xl p-6 text-center text-white">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#F97316] hover:bg-[#EA580C]">
              Retry Loading
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Profile & Status */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Profile Card */}
              <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-white">Profile Details</h2>
                  <Button asChild variant="outline" size="sm" className="bg-transparent text-[#F97316] border-[#F97316]/30 hover:bg-[#F97316]/10">
                    <Link to="/partners/edit-profile">Edit</Link>
                  </Button>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4 bg-gray-800" />
                    <Skeleton className="h-4 w-1/2 bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partner ID</p>
                      <p className="text-white font-mono bg-white/5 inline-block px-2 py-1 rounded">{partner?.partnerId}</p>
                    </div>
                    <div className="grid grid-cols-[24px_1fr] gap-3 items-start text-gray-300">
                      <User className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">{partner?.name}</p>
                      </div>
                      
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p>{partner?.email}</p>
                      
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p>{partner?.phone || 'Not provided'}</p>
                      
                      <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p>{partner?.company}</p>
                      
                      <Briefcase className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p>{partner?.businessType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status Card */}
              <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Account Status</h2>
                
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-800" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Status</span>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${isStatusActive ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                        {isStatusActive ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        {partner?.status || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Member Since</span>
                      <span className="text-white font-medium">{formatDate(partner?.createdDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center"><Clock className="w-4 h-4 mr-2" /> Last Login</span>
                      <span className="text-white font-medium">{formatDate(partner?.lastLogin)}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">Account Manager</p>
                      <p className="text-white font-medium mb-4">{partner?.accountManager || 'Unassigned'}</p>
                      <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        <Link to="/contact">Contact Manager</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3">
                  <Button asChild variant="outline" className="justify-start bg-transparent text-white border-gray-700 hover:bg-white/5 hover:border-gray-500">
                    <Link to="/partners/edit-profile"><Settings className="w-4 h-4 mr-3 text-[#F97316]" /> Edit Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start bg-transparent text-white border-gray-700 hover:bg-white/5 hover:border-gray-500">
                    <Link to="/partners/change-password"><Lock className="w-4 h-4 mr-3 text-[#F97316]" /> Change Password</Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start bg-transparent text-white border-gray-700 hover:bg-white/5 hover:border-gray-500">
                    <Link to="/contact"><MessageSquare className="w-4 h-4 mr-3 text-[#F97316]" /> Contact Support</Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="justify-start bg-[#EF4444]/10 text-[#EF4444] border-transparent hover:bg-[#EF4444]/20 mt-2">
                    <LogOut className="w-4 h-4 mr-3" /> Logout
                  </Button>
                </div>
              </div>

            </div>

            {/* Right Column: Stats & Activity */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 flex flex-col justify-center">
                  <div className="flex items-center text-[#F97316] mb-2">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Documents</span>
                  </div>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 flex flex-col justify-center">
                  <div className="flex items-center text-[#F97316] mb-2">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 flex flex-col justify-center">
                  <div className="flex items-center text-[#F97316] mb-2">
                    <Activity className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Actions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 flex flex-col justify-center">
                  <div className="flex items-center text-gray-400 mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium text-nowrap">Last Active</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">
                    {loading ? '...' : (activities[0]?.timestamp || 'Just now')}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                </div>
                
                <div className="p-6 flex-grow">
                  {loading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
                          <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-1/3 bg-gray-800" />
                            <Skeleton className="h-3 w-1/4 bg-gray-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                      <Activity className="w-12 h-12 mb-3 opacity-20" />
                      <p>No recent activity found</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                      {activities.map((activity, idx) => (
                        <div key={idx} className="relative flex items-start gap-6">
                          <div className="relative z-10 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1F2937] border-2 border-gray-800 flex-shrink-0 text-[#F97316]">
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <div className="pt-1 flex-grow">
                            <p className="text-sm md:text-base font-medium text-white mb-1">
                              {activity.action || 'System Action'}
                            </p>
                            <p className="text-sm text-gray-400 mb-2">
                              {activity.description || 'Action performed on account'}
                            </p>
                            <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}