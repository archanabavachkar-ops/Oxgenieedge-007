import React, { forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const FormCheckbox = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className, 
  id, 
  required,
  checked,
  onCheckedChange,
  children,
  ...props 
}, ref) => {
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-start gap-3">
        <Checkbox
          ref={ref}
          id={inputId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : ''}
          className={cn(
            "mt-1 border-gray-400 data-[state=checked]:bg-[#F97316] data-[state=checked]:border-[#F97316]",
            error ? "border-[#EF4444]" : "",
            className
          )}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          <Label 
            htmlFor={inputId} 
            className={cn(
              "text-sm font-normal cursor-pointer",
              error ? "text-[#EF4444]" : "text-white"
            )}
          >
            {children || label} {required && <span className="text-[#EF4444]">*</span>}
          </Label>
          {helperText && !error && (
            <p className="text-xs text-gray-400">{helperText}</p>
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-[#EF4444] ml-7 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';
export default FormCheckbox;