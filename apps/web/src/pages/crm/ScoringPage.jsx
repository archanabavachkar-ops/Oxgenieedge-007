import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { Flame, Info, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';

const ScoringPage = () => {
  const [topLeads, setTopLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const distributionData = [
    { name: 'Hot (80-100)', count: 45, color: '#e11d48' },
    { name: 'Warm (50-79)', count: 120, color: '#d97706' },
    { name: 'Cold (<50)', count: 85, color: '#64748b' },
  ];

  useEffect(() => {
    // Simulate fetching scores for leads, in real app would aggregate
    const fetchTopLeads = async () => {
      try {
        const records = await pb.collection('leads').getList(1, 6, {
          sort: '-created',
          $autoCancel: false
        });
        
        const scored = records.items.map((lead, idx) => ({
          ...lead,
          score: 95 - (idx * 8) // Mock high scores for the top list
        }));
        setTopLeads(scored);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopLeads();
  }, []);

  return (
    <CrmLayout title="Lead Scoring Engine">
      <Helmet><title>Scoring Engine - CRM</title></Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rules Overview */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" /> Active Scoring Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">Phone Call Completed</span>
                <span className="text-sm font-bold text-emerald-600">+25 pts</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">Form Submission</span>
                <span className="text-sm font-bold text-emerald-600">+20 pts</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">WhatsApp Reply</span>
                <span className="text-sm font-bold text-emerald-600">+15 pts</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">Link Clicked</span>
                <span className="text-sm font-bold text-emerald-600">+10 pts</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">Email Opened</span>
                <span className="text-sm font-bold text-emerald-600">+5 pts</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <span className="text-sm font-medium">Website Visit</span>
                <span className="text-sm font-bold text-emerald-600">+5 pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-4">Top Leads to Contact</h3>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-3">Lead Name</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lead.company || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {lead.score >= 80 ? <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Hot</Badge> : <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warm</Badge>}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{lead.score}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate(`/admin/crm/leads/${lead.id}`)}>
                        Engage <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CrmLayout>
  );
};

export default ScoringPage;