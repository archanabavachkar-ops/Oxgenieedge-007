import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { validatePasswordStrength } from '@/lib/validationUtils';

const FormPassword = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className, 
  id, 
  required,
  showStrength = false,
  value,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;

  const strengthData = showStrength ? validatePasswordStrength(value) : null;

  const strengthColors = {
    weak: 'bg-[#EF4444]',
    fair: 'bg-[#F59E0B]',
    good: 'bg-[#3B82F6]',
    strong: 'bg-[#10B981]'
  };

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
          type={showPassword ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : ''}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          value={value}
          className={cn(
            "bg-[#111827] border-[#374151] text-white focus-visible:ring-[#F97316] focus-visible:border-[#F97316] placeholder:text-gray-500 pr-10 transition-all",
            error && !isFocused ? "border-[#EF4444]" : "",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {error && !isFocused && (
        <p id={errorId} className="text-sm text-[#EF4444] animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}

      {showStrength && value && (
        <div className="space-y-2 mt-2 animate-in fade-in">
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div 
                key={level} 
                className={cn(
                  "flex-1 rounded-full transition-colors duration-300",
                  strengthData.score >= level ? strengthColors[strengthData.strength] : "bg-gray-700"
                )} 
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Requirement met={strengthData.requirements.minLength} text="8+ characters" />
            <Requirement met={strengthData.requirements.hasUppercase} text="Uppercase letter" />
            <Requirement met={strengthData.requirements.hasLowercase} text="Lowercase letter" />
            <Requirement met={strengthData.requirements.hasNumbers} text="Number" />
          </div>
        </div>
      )}

      {helperText && !error && !showStrength && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

const Requirement = ({ met, text }) => (
  <div className={cn("flex items-center gap-1.5", met ? "text-[#10B981]" : "text-gray-500")}>
    {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    <span>{text}</span>
  </div>
);

FormPassword.displayName = 'FormPassword';
export default FormPassword;