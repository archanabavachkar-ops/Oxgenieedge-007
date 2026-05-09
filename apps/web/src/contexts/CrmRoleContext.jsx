import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

export const CrmRoleContext = createContext(null);

export const CrmRoleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [crmRole, setCrmRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!currentUser) {
        setCrmRole(null);
        setLoading(false);
        return;
      }

      try {
        // We use the role stored directly on the user model for global access
        // But for CRM specific permissions, we check the crmUsers collection
        const records = await pb.collection('crmUsers').getFullList({
          filter: `userId="${currentUser.id}"`,
          $autoCancel: false
        });

        if (records.length > 0) {
          setCrmRole(records[0]);
        } else {
          // Fallback to basic user role if no specific CRM user record exists
          setCrmRole({ role: currentUser.role });
        }
      } catch (error) {
        console.error("Failed to fetch CRM role:", error);
        setCrmRole({ role: currentUser?.role || 'user' });
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [currentUser]);

  const hasPermission = (requiredRoles) => {
    if (!crmRole) return false;
    return requiredRoles.includes(crmRole.role.toLowerCase());
  };

  return (
    <CrmRoleContext.Provider value={{ crmRole, loading, hasPermission }}>
      {children}
    </CrmRoleContext.Provider>
  );
};