import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-200 dark:border-[#40383D] bg-white dark:bg-[#211D20] px-3 py-1 text-sm text-slate-800 dark:text-slate-100 shadow-2xs transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
