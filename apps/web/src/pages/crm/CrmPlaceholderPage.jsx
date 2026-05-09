import React from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/components/CrmLayout.jsx';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';

const CrmPlaceholderPage = ({ title = "Module" }) => {
  const navigate = useNavigate();

  return (
    <CrmLayout title={title}>
      <Helmet><title>{title} - CRM</title></Helmet>
      
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          This module is currently under development. Check back soon for updates to the {title} features.
        </p>
        <Button onClick={() => navigate('/admin/crm/dashboard')} variant="default">
          Return to Dashboard
        </Button>
      </div>
    </CrmLayout>
  );
};

export default CrmPlaceholderPage;