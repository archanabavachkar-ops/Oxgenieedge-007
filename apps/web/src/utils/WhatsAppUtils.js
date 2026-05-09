export const formatPhoneNumber = (number) => {
  if (!number) return 'Unknown';
  // Basic formatting, assuming international format without '+'
  const cleaned = ('' + number).replace(/\D/g, '');
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  return `+${cleaned}`;
};

export const formatTimestamp = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'received':
    case 'processed':
    case 'success':
      return 'bg-success/10 text-success border-success/20';
    case 'error':
    case 'failed':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const validateWebhookPayload = (payload) => {
  try {
    if (typeof payload === 'string') {
      JSON.parse(payload);
    }
    return true;
  } catch (e) {
    return false;
  }
};