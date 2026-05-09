
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#22C55E', '#FF6B00', '#EF4444'];

const LeadQualityChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-[#64748B] font-semibold text-sm">No quality data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600 }} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LeadQualityChart;
