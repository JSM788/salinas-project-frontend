"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      defaultValue,
      onChange,
      onValueChange,
      label,
      placeholder = "Seleccionar...",
      disabled = false,
      required,
      name,
      id,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      defaultValue ?? options[0]?.value ?? "",
    );
    const currentValue = isControlled ? value : internalValue;

    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === currentValue);

    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    const handleSelect = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setOpen(false);

      if (onValueChange) {
        onValueChange(nextValue);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: nextValue, name: name ?? "" },
          currentTarget: { value: nextValue, name: name ?? "" },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    const invalid = ariaInvalid === true || ariaInvalid === "true";

    return (
      <div ref={containerRef} className="relative inline-block w-full">
        {label && (
          <label
            htmlFor={controlId}
            className="block text-2xs font-medium text-zinc-500 mb-1"
          >
            {label}
          </label>
        )}

        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue}
            required={required}
          />
        )}

        <button
          ref={ref}
          id={controlId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel ?? label}
          aria-invalid={invalid ? "true" : undefined}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-left text-sm shadow-xs transition-colors",
            "focus-visible:outline-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900",
            "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            open && "border-zinc-900 ring-1 ring-zinc-900",
            invalid &&
              "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
            selectedOption ? "text-zinc-900" : "text-zinc-400",
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-150",
              open && "rotate-180 text-zinc-700",
            )}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-labelledby={controlId}
            className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-zinc-400">
                Sin opciones disponibles
              </li>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === currentValue;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer transition-colors",
                      isSelected
                        ? "bg-zinc-100 font-semibold text-zinc-950"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-zinc-900" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
