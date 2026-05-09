
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[12px] border border-[#E2E8F0] dark:border-border bg-white dark:bg-background px-4 py-3 text-sm text-[#0F172A] dark:text-foreground shadow-sm transition-all duration-300 placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#FF6B00] focus-visible:ring-1 focus-visible:ring-[#FF6B00]/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 resize-y",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
