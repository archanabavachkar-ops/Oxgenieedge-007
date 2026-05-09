import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import CrmSidebar from './CrmSidebar';
import CrmHeader from './CrmHeader';
import Breadcrumb from './Breadcrumb';
import AnimatedPage from './AnimatedPage';

const CrmLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Helmet>
        <title>{title ? `${title} - CRM` : 'CRM Dashboard'}</title>
      </Helmet>

      {/* Sidebar */}
      <CrmSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CrmHeader 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            <AnimatedPage>
              {children}
            </AnimatedPage>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CrmLayout;