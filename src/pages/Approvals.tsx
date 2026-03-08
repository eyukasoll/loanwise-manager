import React from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { loanApplications } from "@/data/mockData";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { fmt } from "@/lib/currency";

export default function Approvals() {
  const pending = loanApplications.filter(l => ["Pending Approval", "Under Review", "Submitted"].includes(l.status));

  return (
    <div>
      <TopBar title="Loan Approvals" subtitle="Review and approve loan applications" />
      <div className="p-6 animate-fade-in">
        {pending.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-success mb-3" />
            <h3 className="font-display font-semibold text-lg">All Caught Up</h3>
            <p className="text-muted-foreground text-sm mt-1">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(loan => (
              <div key={loan.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold">{loan.employeeName}</h3>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{loan.id} · {loan.loanType} · {loan.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-display">{fmt(loan.requestedAmount)}</p>
                    <p className="text-xs text-muted-foreground">{loan.repaymentPeriod} months @ {loan.interestRate}%</p>
                  </div>
                </div>
                <p className="text-sm mt-3"><span className="text-muted-foreground">Purpose:</span> {loan.purpose}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground"><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                  <Button size="sm" variant="outline"><RotateCcw className="w-4 h-4 mr-1" /> Return</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
