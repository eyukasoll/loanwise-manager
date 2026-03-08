import React from "react";
import { Check, Clock, Circle } from "lucide-react";

const TIMELINE_STEPS = [
  { key: "Submitted", label: "Submitted" },
  { key: "Under Review", label: "Under Review" },
  { key: "Pending Approval", label: "Pending Approval" },
  { key: "Approved", label: "Approved" },
  { key: "Disbursed", label: "Disbursed" },
  { key: "Active", label: "Active" },
  { key: "Closed", label: "Closed" },
];

const TERMINAL_STATUSES = ["Rejected", "Cancelled"];

function getStepDate(loan: any, step: string): string | null {
  switch (step) {
    case "Submitted": return loan.application_date;
    case "Approved": return loan.approval_date;
    case "Disbursed": return loan.disbursement_date;
    case "Closed": return loan.closure_date;
    default: return null;
  }
}

export default function ApplicationTimeline({ loan }: { loan: any }) {
  const isTerminal = TERMINAL_STATUSES.includes(loan.status);
  const currentIdx = TIMELINE_STEPS.findIndex(s => s.key === loan.status);

  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">APPLICATION TIMELINE</p>

      {isTerminal ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive/15 text-destructive shrink-0">
            <Circle className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">{loan.status}</p>
            <p className="text-xs text-muted-foreground">
              Originally submitted on {loan.application_date}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-start gap-0 overflow-x-auto pb-1">
          {TIMELINE_STEPS.map((step, idx) => {
            const isPast = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            const date = getStepDate(loan, step.key);

            return (
              <div key={step.key} className="flex flex-col items-center flex-1 min-w-[60px] relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={`absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                      isPast || isCurrent ? "bg-primary" : "bg-border"
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}
                {/* Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                    isPast
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPast ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                {/* Label */}
                <p
                  className={`mt-1.5 text-[10px] leading-tight text-center ${
                    isCurrent ? "font-semibold text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {date && (
                  <p className="text-[9px] text-muted-foreground text-center">{date}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
