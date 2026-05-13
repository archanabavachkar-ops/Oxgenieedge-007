import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, LayoutList, Trello } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CrmDashboardPage = () => {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('table'); // 'table' or 'kanban'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const records = await pb.collection('leads').getFullList({ sort: '-created', $autoCancel: false });
        setLeads(records);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

  return (
    <>
      <Helmet><title>CRM Dashboard - Admin</title></Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary text-gray-900"
                />
              </div>
              <div className="flex bg-white border rounded-lg p-1">
                <button onClick={() => setView('table')} className={`p-2 rounded ${view === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}>
                  <LayoutList className="w-4 h-4" />
                </button>
                <button onClick={() => setView('kanban')} className={`p-2 rounded ${view === 'kanban' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}>
                  <Trello className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {view === 'table' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Interest</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <div>{lead.email}</div>
                        <div>{lead.mobile}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{lead.serviceInterest || '-'}</td>
                      <td className="p-4">
                          <select
                            value={lead.status || 'new'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;

                              try {
                                await pb.collection('leads').update(lead.id, {
                                  status: newStatus
                                });

                                setLeads(prev =>
                                  prev.map(l =>
                                    l.id === lead.id
                                      ? { ...l, status: newStatus }
                                      : l
                                  )
                                );
                              } catch (err) {
                                console.error(err);
                                alert('Failed to update status');
                              }
                            }}
                            className="px-2 py-1 border rounded-lg text-xs"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal_sent">Proposal Sent</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{new Date(lead.created).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {columns.map(col => (
                <div key={col} className="min-w-[300px] bg-gray-100/50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 capitalize mb-4 flex justify-between">
                    {col.replace('_', ' ')}
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {filteredLeads.filter(l => (l.status || 'new') === col).length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {filteredLeads.filter(l => (l.status || 'new') === col).map(lead => (
                      <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{lead.serviceInterest}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CrmDashboardPage;