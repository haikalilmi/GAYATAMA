import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "JOINED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RESUBMITTED"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING"
  | "ACTIVE"
  | "DRAFT"
  | "ARCHIVED"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "EASY"
  | "STANDARD"
  | "LIMITED"
  | "SPONSORED"
  | string;

const statusStyles: Record<string, { label: string; className: string }> = {
  // Participations / Submissions
  JOINED: {
    label: "Aktif Bergabung",
    className: "bg-sky-50 text-sky-700 border-sky-200/70",
  },
  SUBMITTED: {
    label: "Terkirim",
    className: "bg-blue-50 text-blue-700 border-blue-200/70",
  },
  UNDER_REVIEW: {
    label: "UNDER_REVIEW",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
  },
  RESUBMITTED: {
    label: "Telah Direvisi",
    className: "bg-purple-50 text-purple-700 border-purple-200/70",
  },
  REVISION_REQUESTED: {
    label: "Perlu Revisi",
    className: "bg-amber-50 text-amber-800 border-amber-300/70",
  },
  APPROVED: {
    label: "Disetujui",
    className: "bg-emerald-50 text-emerald-700 border-emerald-300/70",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-rose-50 text-rose-700 border-rose-200/70",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  PENDING: {
    label: "PENDING",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  ACTIVE: {
    label: "Aktif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  ARCHIVED: {
    label: "Arsip",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },

  // Risk levels
  LOW: {
    label: "Risiko Rendah",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  HIGH: {
    label: "Risiko Tinggi",
    className: "bg-rose-50 text-rose-700 border-rose-200/80 font-semibold",
  },

  // Difficulties
  EASY: {
    label: "Mudah",
    className: "bg-slate-100 text-slate-700 border-slate-200/80",
  },
  MEDIUM: {
    label: "Sedang",
    className: "bg-sky-50 text-sky-700 border-sky-200/60",
  },

  // Mission types
  STANDARD: {
    label: "Standar",
    className: "bg-slate-100 text-slate-700 border-slate-200/80",
  },
  LIMITED: {
    label: "Terbatas",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  SPONSORED: {
    label: "Sponsor",
    className: "bg-blue-50 text-blue-700 border-blue-200/80",
  },
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  customLabel?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  customLabel,
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const meta = statusStyles[status] || {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200/80",
  };
  const label = customLabel || meta.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight shadow-2xs",
        meta.className,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-75"
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      {status !== label && (
        <span className="font-mono text-[10px] opacity-70">[{status}]</span>
      )}
    </span>
  );
}
