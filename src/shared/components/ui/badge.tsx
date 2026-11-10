import React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border";

  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
    outline: "bg-transparent text-zinc-700 border-zinc-300",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
