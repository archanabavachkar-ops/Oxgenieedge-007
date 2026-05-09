import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AnalyticsDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [leadsRes, revRes] = await Promise.all([
          apiServerClient.fetch('/analytics/leads'),
          apiServerClient.fetch('/analytics/revenue')
        ]);
        setMetrics(await leadsRes.json());
        setRevenue(await revRes.json());
      } catch (error) {
        console.error(error);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#6366F1'];

  // Mock data for charts since backend returns aggregated objects
  const lineData = [
    { name: 'Week 1', leads: 12 }, { name: 'Week 2', leads: 19 },
    { name: 'Week 3', leads: 15 }, { name: 'Week 4', leads: 25 }
  ];

  const pieData = metrics?.leadsByStatus ? Object.entries(metrics.leadsByStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <>
      <Helmet><title>Analytics - Admin</title></Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.totalLeads || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.conversionRate?.toFixed(1) || 0}%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{revenue?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Avg Time to Convert</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.averageTimeToConversion || 0} days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Leads Over Time</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Leads by Status</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AnalyticsDashboardPage;