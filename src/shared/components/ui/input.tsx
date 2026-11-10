import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  showTogglePassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, showTogglePassword, ...props }, ref) => {
    const isPasswordType = type === "password";
    const canToggle = isPasswordType && showTogglePassword !== false;
    const [showPassword, setShowPassword] = useState(false);

    const resolvedType = canToggle ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            {icon}
          </div>
        )}
        <input
          type={resolvedType}
          className={cn(
            "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus-visible:border-rose-500 aria-[invalid=true]:focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-9",
            canToggle && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {canToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-hidden"
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
