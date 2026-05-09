import { useContext } from 'react';
import { CrmRoleContext } from '@/contexts/CrmRoleContext.jsx';

export const useCrmRole = () => {
  const context = useContext(CrmRoleContext);
  if (!context) {
    throw new Error('useCrmRole must be used within a CrmRoleProvider');
  }
  return context;
};