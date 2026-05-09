import * as XLSX from 'xlsx';

export const exportToCSV = (data, filenamePrefix) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        cell = String(cell).replace(/"/g, '""');
        return `"${cell}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_export_${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data, filenamePrefix) => {
  if (!data || !data.length) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Auto-adjust column widths
  const maxWidths = [];
  data.forEach(row => {
    Object.keys(row).forEach((key, i) => {
      const val = row[key] ? String(row[key]) : '';
      maxWidths[i] = Math.max(maxWidths[i] || key.length, val.length);
    });
  });
  worksheet['!cols'] = maxWidths.map(w => ({ wch: w + 2 }));

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filenamePrefix}_export_${date}.xlsx`);
};

export const exportLeadsToCSV = (leads, agentsMap = {}) => {
  if (!leads || !leads.length) return;

  const data = leads.map(lead => ({
    'Name': lead.name || '',
    'Email': lead.email || '',
    'Phone': lead.mobile || '',
    'Status': lead.status || '',
    'Priority': lead.priority || '',
    'Assigned Agent': agentsMap[lead.assignedTo]?.name || 'Unassigned',
    'Created Date': lead.created ? new Date(lead.created).toLocaleDateString() : ''
  }));

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        cell = String(cell).replace(/"/g, '""');
        return `"${cell}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = Date.now();
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};