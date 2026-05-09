import React, { forwardRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const FormSelect = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [], 
  placeholder = "Select an option",
  className, 
  id, 
  required,
  value,
  onValueChange,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label htmlFor={inputId} className="text-white font-medium">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </Label>
      )}
      
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        onOpenChange={setIsOpen}
        {...props}
      >
        <SelectTrigger 
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : ''}
          className={cn(
            "bg-[#111827] border-[#374151] text-white focus:ring-[#F97316] focus:border-[#F97316] transition-all",
            error && !isOpen ? "border-[#EF4444] focus:ring-[#EF4444]" : "",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#1F2937] border-[#374151] text-white">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value || opt} 
              value={opt.value || opt}
              className="focus:bg-[#F97316] focus:text-white cursor-pointer"
            >
              {opt.label || opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && !isOpen && (
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

FormSelect.displayName = 'FormSelect';
export default FormSelect;