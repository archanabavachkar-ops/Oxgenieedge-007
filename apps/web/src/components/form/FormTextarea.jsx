import React, { forwardRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const FormTextarea = forwardRef(({ 
  label, 
  error, 
  helperText, 
  maxLength,
  value = '',
  className, 
  id, 
  required,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;
  
  const currentLength = (value || '').length;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-end">
        {label && (
          <Label htmlFor={inputId} className="text-white font-medium">
            {label} {required && <span className="text-[#EF4444]">*</span>}
          </Label>
        )}
        {maxLength && (
          <span className={cn(
            "text-xs font-medium transition-colors",
            isOverLimit ? "text-[#EF4444]" : isNearLimit ? "text-[#F59E0B]" : "text-gray-500"
          )}>
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      
      <Textarea
        ref={ref}
        id={inputId}
        value={value}
        aria-invalid={!!error || isOverLimit}
        aria-describedby={error ? errorId : ''}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        className={cn(
          "bg-[#111827] border-[#374151] text-white focus-visible:ring-[#F97316] focus-visible:border-[#F97316] placeholder:text-gray-500 min-h-[100px] resize-y transition-all",
          (error || isOverLimit) && !isFocused ? "border-[#EF4444] focus-visible:ring-[#EF4444]" : "",
          className
        )}
        {...props}
      />

      {error && !isFocused && (
        <p id={errorId} className="text-sm text-[#EF4444] animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';
export default FormTextarea;