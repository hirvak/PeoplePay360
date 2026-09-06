import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm text-left border-collapse", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#211D20]", className)} {...props} />;
}

export function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn("border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 font-medium text-slate-800 dark:text-slate-200", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-purple-50/40 dark:hover:bg-purple-950/30 data-[state=selected]:bg-purple-50 dark:data-[state=selected]:bg-purple-950/40",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-10 px-4 py-3 align-middle font-bold text-slate-700 dark:text-slate-200 text-left tracking-wide select-none",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={cn("p-4 align-middle text-slate-700 dark:text-slate-300 font-medium", className)} {...props} />;
}

export function TableCaption({ className, ...props }) {
  return <caption className={cn("mt-4 text-xs text-slate-500 dark:text-slate-400", className)} {...props} />;
}
