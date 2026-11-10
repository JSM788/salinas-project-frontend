import React from "react";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        {label && (
          <span className="block text-2xs font-medium text-zinc-500 mb-1">
            {label}
          </span>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-8 py-1.5 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus-visible:border-rose-500 aria-[invalid=true]:focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 cursor-pointer",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
