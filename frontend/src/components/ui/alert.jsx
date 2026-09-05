import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const alertVariants = {
  default: "bg-purple-50 text-purple-900 border-purple-200 icon-purple-600",
  destructive: "bg-rose-50 text-rose-900 border-rose-200 icon-rose-600",
  success: "bg-emerald-50 text-emerald-900 border-emerald-200 icon-emerald-600",
  warning: "bg-amber-50 text-amber-900 border-amber-200 icon-amber-600",
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
