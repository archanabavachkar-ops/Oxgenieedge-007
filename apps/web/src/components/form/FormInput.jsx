import React, { forwardRef, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const FormInput = forwardRef(({ 
  label, 
  error, 
  helperText, 
  success, 
  className, 
  id, 
  required,
  onFocus,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  const showSuccess = success && !error && !isFocused && props.value;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label htmlFor={inputId} className="text-white font-medium">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={cn(error ? errorId : '', helperText ? helperId : '')}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "bg-[#111827] border-[#374151] text-white focus-visible:ring-[#F97316] focus-visible:border-[#F97316] placeholder:text-gray-500 transition-all",
            error && !isFocused ? "border-[#EF4444] focus-visible:ring-[#EF4444]" : "",
            showSuccess ? "border-[#10B981]" : "",
            className
          )}
          {...props}
        />
        {showSuccess && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981]" />
        )}
        {error && !isFocused && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#EF4444]" />
        )}
      </div>
      {error && !isFocused && (
        <p id={errorId} className="text-sm text-[#EF4444] animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';
export default FormInput;