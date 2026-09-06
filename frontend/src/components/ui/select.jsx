import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1 pr-8 text-sm text-slate-800 dark:text-slate-100 shadow-2xs transition-colors focus-visible:outline-hidden focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-[#211D20] [&>option]:dark:text-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
    </div>
  );
});
Select.displayName = "Select";
