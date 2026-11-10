import React from "react";
import Link from "next/link";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
  /** Section the card summarizes; the whole card becomes a link to it. */
  href: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, caption, href }) => (
  <Link
    href={href}
    className="bg-white border border-zinc-200/90 rounded-xl p-4 flex items-center gap-4 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50/60 transition-colors"
  >
    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-zinc-900 mt-0.5 truncate">{value}</p>
      <p className="text-2xs text-zinc-400 mt-0.5 truncate">{caption}</p>
    </div>
  </Link>
);
