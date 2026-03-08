import React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  outline: "border border-border text-muted-foreground",
};

const statusTranslationMap: Record<string, keyof typeof import("@/i18n/en").default> = {
  active: "statusActive",
  approved: "statusApproved",
  closed: "statusClosed",
  paid: "statusPaid",
  disbursed: "statusDisbursed",
  "pending approval": "statusPendingApproval",
  "under review": "statusUnderReview",
  submitted: "statusSubmitted",
  pending: "statusPending",
  overdue: "statusOverdue",
  rejected: "statusRejected",
  cancelled: "statusCancelled",
  "written off": "statusWrittenOff",
  draft: "statusDraft",
  recommended: "statusRecommended",
  scheduled: "statusScheduled",
  processed: "statusProcessed",
  probation: "statusProbation",
  contract: "statusContract",
  terminated: "statusTerminated",
  resigned: "statusResigned",
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useLanguage();
  
  let variant: BadgeVariant = "default";
  const s = status.toLowerCase();
  if (["active", "approved", "closed", "paid", "disbursed"].includes(s)) variant = "success";
  else if (["pending approval", "under review", "submitted", "pending"].includes(s)) variant = "warning";
  else if (["overdue", "rejected", "cancelled", "written off"].includes(s)) variant = "destructive";
  else if (["draft", "recommended"].includes(s)) variant = "info";

  const key = statusTranslationMap[s];
  const label = key ? (t as any)[key] : status;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {label}
    </span>
  );
}
