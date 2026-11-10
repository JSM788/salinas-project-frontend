"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerIcon = <MoreVertical className="h-4 w-4" />,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (e: React.MouseEvent, item: ActionMenuItem) => {
    e.stopPropagation();
    if (item.disabled) return;
    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400",
          isOpen && "bg-zinc-100 text-zinc-800"
        )}
        title="Más opciones"
      >
        {triggerIcon}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute mt-1 w-44 rounded-lg bg-white border border-zinc-200/90 shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, index) => {
            const isDanger = item.variant === "danger";

            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-xs transition-colors",
                    isDanger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="font-medium truncate">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={index}
                type="button"
                onClick={(e) => handleItemClick(e, item)}
                disabled={item.disabled}
                className={cn(
                  "w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs transition-colors",
                  isDanger
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
