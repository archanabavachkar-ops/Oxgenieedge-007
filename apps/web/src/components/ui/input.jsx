
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[12px] border border-[#E2E8F0] dark:border-border bg-white dark:bg-background px-4 py-2 text-sm text-[#0F172A] dark:text-foreground shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#FF6B00] focus-visible:ring-1 focus-visible:ring-[#FF6B00]/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
