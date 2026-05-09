import React, { useState } from 'react';
import CRMSidebar from '@/components/CrmSidebar.jsx';
import CRMHeader from '@/components/CrmHeader.jsx';
import CRMBreadcrumb from '@/components/crm/CRMBreadcrumb.jsx';
import { motion } from 'framer-motion';

export default function CRMLayout({ children, title, description, breadcrumbs }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-[#F8FAFC] dark:bg-background overflow-hidden font-body">
      <CRMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <CRMHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {(breadcrumbs || title || description) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-3 mb-10"
              >
                {breadcrumbs && (
                  <div className="mb-6">
                    <CRMBreadcrumb items={breadcrumbs} />
                  </div>
                )}
                {title && (
                  <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#0F172A] dark:text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-[#64748B] dark:text-muted-foreground text-base md:text-lg max-w-3xl font-medium">
                    {description}
                  </p>
                )}
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="pb-12"
            >
              {children}
            </motion.div>
            
          </div>
        </main>
      </div>
    </div>
  );
}