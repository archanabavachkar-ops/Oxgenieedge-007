
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

const COLORS = ['#FF6B00', '#0F172A', '#FFA24C', '#0EA5E9', '#22C55E'];

export const SourcePieChart = ({ data }) => {
  const chartData = data || [
    { name: 'Organic Search', value: 400 },
    { name: 'Direct', value: 300 },
    { name: 'Social Media', value: 300 },
    { name: 'Referral', value: 200 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ConversionBarChart = ({ data }) => {
  const chartData = data || [
    { name: 'Jan', value: 24 }, { name: 'Feb', value: 28 }, { name: 'Mar', value: 35 },
    { name: 'Apr', value: 32 }, { name: 'May', value: 48 }, { name: 'Jun', value: 52 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="name" stroke="#64748B" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748B" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
        <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600, color: '#FF6B00' }} />
        <Bar dataKey="value" fill="#FF6B00" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CampaignLineChart = ({ data }) => {
  const chartData = data || [
    { name: 'Week 1', clicks: 400, conversions: 24 },
    { name: 'Week 2', clicks: 600, conversions: 35 },
    { name: 'Week 3', clicks: 550, conversions: 42 },
    { name: 'Week 4', clicks: 800, conversions: 65 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="name" stroke="#64748B" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748B" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 600, color: '#0F172A' }} />
        <Legend wrapperStyle={{ fontWeight: 600, fontSize: '13px' }} />
        <Line type="monotone" dataKey="clicks" stroke="#0F172A" strokeWidth={4} dot={{ r: 5, fill: '#0F172A' }} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="conversions" stroke="#FF6B00" strokeWidth={4} dot={{ r: 5, fill: '#FF6B00' }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
