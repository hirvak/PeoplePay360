import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-purple-100 text-purple-800 border-purple-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  destructive: "bg-rose-50 text-rose-700 border-rose-200",
  secondary: "bg-slate-100 text-slate-700 border-slate-200",
  outline: "bg-white text-slate-600 border-slate-200",
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
