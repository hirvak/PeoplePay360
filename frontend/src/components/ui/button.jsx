import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-500 shadow-xs",
  secondary: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-2xs",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs",
};

const buttonSizes = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-9 px-4 text-sm rounded-md gap-2",
  lg: "h-10 px-5 text-base rounded-lg gap-2.5",
  icon: "h-9 w-9 p-0 rounded-md justify-center items-center",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "md", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          buttonVariants[variant] || buttonVariants.default,
          buttonSizes[size] || buttonSizes.md,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
