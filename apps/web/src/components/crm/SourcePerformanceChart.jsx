
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const SourcePerformanceChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-[#64748B] font-semibold text-sm">No source data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 600}} dy={10} />
        <YAxis yAxisId="left" orientation="left" stroke="#FF6B00" axisLine={false} tickLine={false} tick={{fontSize: 13, fontWeight: 600}} />
        <YAxis yAxisId="right" orientation="right" stroke="#0F172A" axisLine={false} tickLine={false} tick={{fontSize: 13, fontWeight: 600}} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          cursor={{fill: '#F8FAFC'}}
          itemStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }} />
        <Bar yAxisId="left" dataKey="conversionRate" name="Conversion %" fill="#FF6B00" radius={[6, 6, 0, 0]} barSize={24} />
        <Bar yAxisId="right" dataKey="costPerLead" name="Cost/Lead ($)" fill="#0F172A" radius={[6, 6, 0, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SourcePerformanceChart;
