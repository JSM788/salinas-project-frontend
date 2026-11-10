import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function LoadingIndicator({
  fullScreen = false,
  label = "Cargando…",
  className,
}: {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center text-zinc-500",
        fullScreen ? "fixed inset-0 z-50 bg-white" : "p-4",
        className,
      )}
    >
      <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
