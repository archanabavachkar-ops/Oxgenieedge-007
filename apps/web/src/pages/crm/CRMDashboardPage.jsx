import React from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import FoundersDashboardPage from '@/pages/FoundersDashboardPage.jsx';

export default function CRMDashboardPage() {
  return (
    <CRMLayout
      title="Revenue Command Center"
      description="Real-time insights into your AI Call Centre performance"
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Dashboard' }
      ]}
    >
      {/* We render FoundersDashboardPage directly. 
          Note: FoundersDashboardPage has its own header and padding, 
          so we might want to adjust it in a real app, but per instructions we wrap it. */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6">
        <FoundersDashboardPage />
      </div>
    </CRMLayout>
  );
}