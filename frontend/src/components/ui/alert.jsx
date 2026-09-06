import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const alertVariants = {
  default: "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800 icon-purple-600 dark:icon-purple-400",
  destructive: "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800 icon-rose-600 dark:icon-rose-400",
  success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 icon-emerald-600 dark:icon-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 icon-amber-600 dark:icon-amber-400",
};

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
};

export function Alert({ className, variant = "default", title, children, ...props }) {
  const Icon = icons[variant] || Info;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 flex gap-3 text-sm shadow-2xs transition-all",
        alertVariants[variant] || alertVariants.default,
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
