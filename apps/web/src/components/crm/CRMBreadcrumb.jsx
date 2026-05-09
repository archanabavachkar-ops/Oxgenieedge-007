import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils.js';

export default function CRMBreadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link to="/admin/crm/dashboard" className="hover:text-foreground transition-colors flex items-center">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5 mx-1.5 opacity-50" />
          {item.path ? (
            <Link 
              to={item.path} 
              className={cn(
                "hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-[200px]",
                index === items.length - 1 && "text-foreground font-medium pointer-events-none"
              )}
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "truncate max-w-[150px] sm:max-w-[200px]",
                index === items.length - 1 && "text-foreground font-medium"
              )}
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}