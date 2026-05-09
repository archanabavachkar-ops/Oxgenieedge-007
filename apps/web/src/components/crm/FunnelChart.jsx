
import React from 'react';
import { Funnel, FunnelChart as RechartsFunnelChart, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const FunnelChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    data = [
      { name: 'New Leads', value: 1000, fill: '#0F172A' },
      { name: 'Contacted', value: 800, fill: '#1E293B' },
      { name: 'Qualified', value: 450, fill: '#FFA24C' },
      { name: 'Proposal', value: 280, fill: '#FF6B00' },
      { name: 'Won', value: 150, fill: '#22C55E' },
    ];
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsFunnelChart>
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 600 }} />
          <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList position="right" fill="#0F172A" stroke="none" dataKey="name" style={{ fontWeight: 600, fontSize: '14px' }} />
            <LabelList position="center" fill="#fff" stroke="none" dataKey="value" style={{ fontWeight: 800, fontSize: '16px' }} />
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FunnelChart;
