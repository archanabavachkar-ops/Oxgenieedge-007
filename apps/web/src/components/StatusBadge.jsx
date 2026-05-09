
import React from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { cn } from '@/lib/utils.js';

export default function StatusBadge({ status, className }) {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-transparent';
      case 'suspended':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium capitalize", getStatusStyles(status), className)}>
      {status}
    </Badge>
  );
}
