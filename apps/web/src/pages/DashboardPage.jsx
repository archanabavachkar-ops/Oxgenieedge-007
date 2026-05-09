import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Package, ShoppingBag, Calendar, User, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.email) {
        setLoadingOrders(false);
        return;
      }
      
      try {
        setError(null);
        const records = await pb.collection('orders').getFullList({
          filter: `customerEmail = "${currentUser.email}"`,
          sort: '-created',
          $autoCancel: false
        });
        setOrders(records);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("We couldn't load your orders at this time. Please try refreshing the page.");
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]);

  const quickActions = [
    {
      icon: ShoppingBag,
      title: 'View Services',
      description: 'Explore our marketing and development services',
      link: '/services',
    },
    {
      icon: Package,
      title: 'View Products',
      description: 'Check out our subscription products',
      link: '/products',
    },
    {
      icon: Calendar,
      title: 'Book Consultation',
      description: 'Schedule a free consultation call',
      link: '/contact',
    },
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': case 'new order': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'failed': case 'cancelled': return 'bg-destructive/10 text-destructive border border-destructive/20';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${currentUser?.name || 'User'} - OxgenieEdge`}</title>
        <meta name="description" content="Manage your OxgenieEdge account, services, and products from your dashboard." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Welcome back, {currentUser?.name || 'User'}
            </h1>
            <p className="text-slate-600 text-lg">Manage your account and explore our services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                  <action.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-primary" /> Order History
                  </h2>
                </div>
                
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-destructive/5 rounded-2xl border border-destructive/20">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-900 font-semibold text-lg">No orders found</p>
                    <p className="text-slate-500 mt-2">When you purchase services, they will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                          <th className="pb-4 font-semibold px-2">Order ID</th>
                          <th className="pb-4 font-semibold px-2">Date</th>
                          <th className="pb-4 font-semibold px-2">Total</th>
                          <th className="pb-4 font-semibold px-2">Status</th>
                          <th className="pb-4 font-semibold px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <td className="py-5 px-2 font-semibold text-slate-900">{order.orderId || order.id.substring(0,8).toUpperCase()}</td>
                            <td className="py-5 px-2 text-slate-600">{new Date(order.created).toLocaleDateString()}</td>
                            <td className="py-5 px-2 font-semibold text-slate-900">₹{order.totalAmount?.toLocaleString() || '0'}</td>
                            <td className="py-5 px-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(order.status)}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-5 px-2 text-right">
                              <button className="text-primary hover:text-primary/80 font-semibold inline-flex items-center">
                                Details <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Profile</h2>
                    <p className="text-sm text-slate-500">Your details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</span>
                    <p className="text-slate-900 font-semibold mt-1 text-lg">{currentUser?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <p className="text-slate-900 font-medium mt-1">{currentUser?.email}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <button className="text-sm text-primary font-semibold hover:underline inline-flex items-center">
                      Edit Profile <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;