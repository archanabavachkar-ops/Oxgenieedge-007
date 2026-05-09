import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ 
  size = 'medium', 
  text, 
  className 
}) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-4", className)}
      aria-busy="true"
      role="status"
    >
      <Loader2 
        className={cn("animate-spin text-[#F97316]", sizeClasses[size])} 
        aria-hidden="true"
      />
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}