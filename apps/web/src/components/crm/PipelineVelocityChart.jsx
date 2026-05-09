
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PipelineVelocityChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-[#64748B] font-semibold text-sm">No velocity data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 600}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 600}} tickFormatter={(val) => `$${val/1000}k`} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          itemStyle={{ fontWeight: 600, color: '#FF6B00' }}
          labelStyle={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PipelineVelocityChart;
