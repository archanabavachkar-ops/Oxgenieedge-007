import React from 'react';
import { cn } from '@/lib/utils';

export default function SkeletonLoader({ 
  className, 
  width, 
  height, 
  circle = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#374151]",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}