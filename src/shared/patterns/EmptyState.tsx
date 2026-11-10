import React from "react";
import { FolderX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-200 rounded-lg bg-white my-4">
      <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-100">
        {icon || <FolderX className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
