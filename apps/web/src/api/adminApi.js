
import pb from '@/lib/pocketbaseClient';

// --- Existing Functions ---
export const fetchDashboardStats = async () => {
  try {
    const leads = await pb.collection('leads').getFullList({
      $autoCancel: false,
      sort: '-created'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLeads = leads.length;
    const newLeadsToday = leads.filter(lead => new Date(lead.created) >= today).length;
    const assignedLeads = leads.filter(lead => lead.assignedTo && lead.assignedTo !== '').length;
    const pendingLeads = leads.filter(lead => lead.status === 'New Lead' || lead.status === 'New').length;

    const leadsBySource = leads.reduce((acc, lead) => {
      const source = lead.source || 'Other';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      totalLeads,
      newLeadsToday,
      assignedLeads,
      pendingLeads,
      leadsBySource
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchRecentLeads = async (limit = 10) => {
  try {
    const records = await pb.collection('leads').getList(1, limit, {
      sort: '-created',
      $autoCancel: false
    });
    return records.items;
  } catch (error) {
    console.error('Error fetching recent leads:', error);
    throw error;
  }
};

export const fetchLeadsBySource = async (source) => {
  try {
    const records = await pb.collection('leads').getFullList({
      filter: `source = "${source}"`,
      sort: '-created',
      $autoCancel: false
    });
    return records;
  } catch (error) {
    console.error(`Error fetching leads for source ${source}:`, error);
    throw error;
  }
};

export const fetchAllLeads = async (page = 1, limit = 50) => {
  try {
    const records = await pb.collection('leads').getList(page, limit, {
      sort: '-created',
      $autoCancel: false
    });
    return records;
  } catch (error) {
    console.error('Error fetching all leads:', error);
    throw error;
  }
};

export const fetchLeadsWithFilters = async (page = 1, limit = 10, filters = {}) => {
  try {
    const { search, source, status, sortBy = '-created' } = filters;
    const filterParts = [];

    if (search) {
      const safeSearch = search.replace(/"/g, '\\"');
      filterParts.push(`(name ~ "${safeSearch}" || email ~ "${safeSearch}" || mobile ~ "${safeSearch}")`);
    }

    if (source && source !== 'All') {
      filterParts.push(`source = "${source}"`);
    }

    if (status && status !== 'All') {
      filterParts.push(`status = "${status}"`);
    }

    const filterString = filterParts.join(' && ');

    const records = await pb.collection('leads').getList(page, limit, {
      filter: filterString,
      sort: sortBy,
      expand: 'assignedTo',
      $autoCancel: false
    });

    return {
      leads: records.items,
      total: records.totalItems,
      pages: records.totalPages
    };
  } catch (error) {
    console.error('Error fetching leads with filters:', error);
    throw error;
  }
};

export const updateLeadStatus = async (leadId, newStatus) => {
  try {
    const record = await pb.collection('leads').update(leadId, { status: newStatus }, { $autoCancel: false });
    return record;
  } catch (error) {
    console.error(`Error updating status for lead ${leadId}:`, error);
    throw error;
  }
};

export const deleteLead = async (leadId) => {
  try {
    await pb.collection('leads').delete(leadId, { $autoCancel: false });
    return true;
  } catch (error) {
    console.error(`Error deleting lead ${leadId}:`, error);
    throw error;
  }
};

export const assignLeadToTeamMember = async (leadId, userId) => {
  try {
    const record = await pb.collection('leads').update(leadId, { assignedTo: userId }, { $autoCancel: false });
    return record;
  } catch (error) {
    console.error(`Error assigning lead ${leadId} to user ${userId}:`, error);
    throw error;
  }
};

export const fetchLeadDetailsWithActivity = async (leadId) => {
  try {
    const lead = await pb.collection('leads').getOne(leadId, {
      expand: 'assignedTo',
      $autoCancel: false
    });

    let activities = [];
    try {
      activities = await pb.collection('crmActivity').getFullList({
        filter: `leadId = "${leadId}"`,
        sort: '-createdAt',
        expand: 'userId',
        $autoCancel: false
      });
    } catch (err) {
      console.warn(`Could not fetch activities for lead ${leadId}.`, err);
    }

    return {
      ...lead,
      activities
    };
  } catch (error) {
    console.error(`Error fetching details for lead ${leadId}:`, error);
    throw error;
  }
};

export const exportLeadsToCSV = (leads) => {
  if (!leads || leads.length === 0) return;

  const headers = ['ID', 'Name', 'Email', 'Mobile', 'Source', 'Status', 'Assigned To', 'Created At'];
  
  const csvRows = leads.map(lead => {
    return [
      lead.id,
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.mobile || '').replace(/"/g, '""')}"`,
      `"${(lead.source || '').replace(/"/g, '""')}"`,
      `"${(lead.status || '').replace(/"/g, '""')}"`,
      `"${(lead.expand?.assignedTo?.name || lead.expand?.assignedTo?.email || lead.assignedTo || 'Unassigned').replace(/"/g, '""')}"`,
      `"${new Date(lead.created).toISOString()}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- New Activity Functions ---

export const fetchActivitiesWithFilters = async (page = 1, limit = 20, filters = {}) => {
  try {
    const { search, eventType, source, startDate, endDate } = filters;
    const filterParts = [];

    if (search) {
      const safeSearch = search.replace(/"/g, '\\"');
      filterParts.push(`(description ~ "${safeSearch}" || leadId.name ~ "${safeSearch}" || leadId.email ~ "${safeSearch}")`);
    }

    if (eventType && eventType !== 'All') {
      filterParts.push(`eventType = "${eventType}"`);
    }

    if (source && source !== 'All') {
      filterParts.push(`source = "${source}"`);
    }

    if (startDate && endDate) {
      // Format dates to match PocketBase requirements (YYYY-MM-DD HH:mm:ss)
      const startStr = new Date(startDate).toISOString().replace('T', ' ').substring(0, 19);
      const endStr = new Date(endDate).toISOString().replace('T', ' ').substring(0, 19);
      filterParts.push(`createdAt >= "${startStr}" && createdAt <= "${endStr}"`);
    }

    const filterString = filterParts.join(' && ');

    const records = await pb.collection('crmActivity').getList(page, limit, {
      filter: filterString,
      sort: '-createdAt',
      expand: 'leadId,userId',
      $autoCancel: false
    });

    return {
      activities: records.items,
      total: records.totalItems,
      pages: records.totalPages
    };
  } catch (error) {
    console.error('Error fetching activities with filters:', error);
    throw error;
  }
};

export const fetchActivitiesByEventType = async (eventType, page = 1, limit = 20) => {
  return fetchActivitiesWithFilters(page, limit, { eventType });
};

export const fetchActivitiesBySource = async (source, page = 1, limit = 20) => {
  return fetchActivitiesWithFilters(page, limit, { source });
};

export const fetchActivitiesByDateRange = async (startDate, endDate, page = 1, limit = 20) => {
  return fetchActivitiesWithFilters(page, limit, { startDate, endDate });
};
