import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useUpdateLoanApplication } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { useLanguage } from "@/i18n/LanguageContext";
import { CheckCircle, XCircle, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/currency";
import { toast } from "sonner";
import LoanApplicationDocument from "@/components/applications/LoanApplicationDocument";

export default function Approvals() {
  const { data: applications = [], isLoading } = useLoanApplications();
  const updateMut = useUpdateLoanApplication();
  const { canEdit } = usePermissions();
  const [docLoan, setDocLoan] = useState<any>(null);

  const pending = applications.filter((l: any) => ["Pending Approval", "Under Review", "Submitted"].includes(l.status));

  const handleAction = (id: string, action: "Approved" | "Rejected" | "Draft") => {
    const label = action === "Approved" ? "approved" : action === "Rejected" ? "rejected" : "returned";
    updateMut.mutate(
      {
        id,
        status: action,
        ...(action === "Approved" ? {
          approval_date: new Date().toISOString().split("T")[0],
          approved_by: "Current User",
          approved_amount: applications.find((l: any) => l.id === id)?.requested_amount,
        } : {}),
      },
      { onSuccess: () => toast.success(`Loan ${label} successfully`) }
    );
  };

  return (
    <div>
      <TopBar title="Loan Approvals" subtitle="Review and approve loan applications" />
      <div className="p-6 animate-fade-in">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-success mb-3" />
            <h3 className="font-display font-semibold text-lg">All Caught Up</h3>
            <p className="text-muted-foreground text-sm mt-1">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((loan: any) => (
              <div key={loan.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold">{loan.employees?.full_name}</h3>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{loan.application_number} · {loan.loan_types?.name} · {loan.employees?.department}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-bold font-display">{fmt(loan.requested_amount)}</p>
                    <p className="text-xs text-muted-foreground">{loan.repayment_period_months} months @ {loan.interest_rate}%</p>
                    <Button size="sm" variant="outline" onClick={() => setDocLoan(loan)}>
                      <FileText className="w-4 h-4 mr-1" /> Document
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-3"><span className="text-muted-foreground">Purpose:</span> {loan.purpose || "—"}</p>
                {canEdit("Approvals") && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleAction(loan.id, "Approved")} disabled={updateMut.isPending}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(loan.id, "Rejected")} disabled={updateMut.isPending}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(loan.id, "Draft")} disabled={updateMut.isPending}>
                      <RotateCcw className="w-4 h-4 mr-1" /> Return
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <LoanApplicationDocument open={!!docLoan} onClose={() => setDocLoan(null)} loan={docLoan} />
    </div>
  );
}
