
import React from 'react';
import { Helmet } from 'react-helmet';
import CrmDashboardPage from '@/pages/crm/Temp.jsx';

const AdminDashboard = () => {
  // The prompt requested to render the CRM dashboard as the default admin view.
  // Since CrmDashboardPage already includes the CrmLayout (which has its own sidebar/header),
  // we simply return it here to act as the main dashboard view.
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - CRM</title>
      </Helmet>
      <CrmDashboardPage />
    </>
  );
};

export default AdminDashboard;
