import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DEPRECATED: This file has been replaced by IntegrationsMainPage.jsx.
 * It immediately redirects to the new hub if a user visits the old route.
 */
const IntegrationsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/crm/integrations', { replace: true });
  }, [navigate]);

  return null;
};

export default IntegrationsPage;