import React from "react";
import { cn } from "@/shared/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-6 border-b border-zinc-200", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors select-none flex items-center gap-1.5 cursor-pointer",
              isActive ? "text-zinc-950 font-semibold" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-2xs rounded-full",
                  isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
