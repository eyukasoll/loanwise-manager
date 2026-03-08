import React, { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useUpdateGuarantor } from "@/hooks/useLoans";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, ShieldCheck, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import GuaranteeApprovalDocument from "@/components/applications/GuaranteeApprovalDocument";
import { useLanguage } from "@/i18n/LanguageContext";

function GuarantorStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    Rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

export default function GuaranteeApprovals() {
  const { t } = useLanguage();
  const { data: applications = [], isLoading } = useLoanApplications();
  const { role } = useAuth();
  const { data: currentEmployee } = useCurrentEmployee();
  const updateGuarantor = useUpdateGuarantor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [docLoan, setDocLoan] = useState<any>(null);

  const isAdminOrManager = role === "admin" || role === "manager";

  // Fetch all guarantors with their employee info + status
  const { data: allGuarantors = [] } = useQuery({
    queryKey: ["all_loan_guarantors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_guarantors")
        .select("*, employees(full_name, employee_id, department, position)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Group guarantors by loan application id
  const guarantorsByLoan = useMemo(() => {
    const map = new Map<string, any[]>();
    allGuarantors.forEach((g: any) => {
      const list = map.get(g.loan_application_id) || [];
      list.push(g);
      map.set(g.loan_application_id, list);
    });
    return map;
  }, [allGuarantors]);

  // For regular employees: only show loans where THEY are a guarantor
  // For admin/manager: show all loans with guarantors
  const loansWithGuarantors = useMemo(() => {
    if (isAdminOrManager) {
      return applications.filter((loan: any) => guarantorsByLoan.has(loan.id));
    }
    if (!currentEmployee) return [];
    // Filter to loans where this employee is assigned as guarantor
    const myLoanIds = new Set(
      allGuarantors
        .filter((g: any) => g.employee_id === currentEmployee.id)
        .map((g: any) => g.loan_application_id)
    );
    return applications.filter((loan: any) => myLoanIds.has(loan.id));
  }, [applications, guarantorsByLoan, allGuarantors, currentEmployee, isAdminOrManager]);

  const filtered = loansWithGuarantors.filter((loan: any) => {
    const term = search.toLowerCase();
    const name = loan.employees?.full_name || "";
    const appNo = loan.application_number || "";
    const gNames = (guarantorsByLoan.get(loan.id) || [])
      .map((g: any) => g.employees?.full_name || "")
      .join(" ");
    return (
      name.toLowerCase().includes(term) ||
      appNo.toLowerCase().includes(term) ||
      gNames.toLowerCase().includes(term)
    );
  });

  const handleGuarantorAction = (guarantorId: string, action: "Approved" | "Rejected") => {
    updateGuarantor.mutate(
      {
        id: guarantorId,
        status: action,
        approved_by: currentEmployee?.full_name || "Current User",
        approved_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success(`Guarantor ${action.toLowerCase()} successfully`);
          // Refresh loan applications to pick up auto-approved status
          queryClient.invalidateQueries({ queryKey: ["loan_applications"] });
        },
      }
    );
  };

  // Check if the current user is the guarantor for a specific record
  const isOwnGuarantee = (guarantor: any) => {
    return currentEmployee?.id === guarantor.employee_id;
  };

  // Can this user act on a guarantor record?
  const canActOnGuarantor = (guarantor: any) => {
    if (isAdminOrManager) return true;
    return isOwnGuarantee(guarantor);
  };

  return (
    <div>
      <TopBar
        title={t.gaTitle}
        subtitle={
          isAdminOrManager
            ? "Review and approve guarantors assigned to loan applications"
            : "Review and approve your guarantee commitments"
        }
      />
      <div className="p-3 sm:p-6 animate-fade-in">
        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by borrower, application or guarantor..."
              className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-80"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto text-success mb-3" />
            <h3 className="font-display font-semibold text-lg">
              {isAdminOrManager ? "No Guarantee Records" : "No Guarantees Assigned to You"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdminOrManager
                ? "No loan applications with assigned guarantors found."
                : "You have no pending guarantee commitments to review."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((loan: any) => {
              const guarantors = guarantorsByLoan.get(loan.id) || [];
              const allApproved = guarantors.every((g: any) => g.status === "Approved");
              const hasRejected = guarantors.some((g: any) => g.status === "Rejected");

              return (
                <div key={loan.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display font-semibold">{loan.employees?.full_name}</h3>
                        <StatusBadge status={loan.status} />
                        {allApproved && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            All Guarantors Approved
                          </span>
                        )}
                        {hasRejected && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-600 border-red-500/30">
                            Guarantor Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loan.application_number} · {loan.loan_types?.name} · {loan.employees?.department}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold font-display">{fmt(loan.requested_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {loan.repayment_period_months} months @ {loan.interest_rate}%
                      </p>
                    </div>
                  </div>

                  {/* Guarantor List with Actions */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {isAdminOrManager ? "Assigned Guarantors" : "Your Guarantee Commitment"}
                    </p>
                    <div className="space-y-2">
                      {guarantors.map((g: any, i: number) => {
                        const isOwn = isOwnGuarantee(g);
                        return (
                          <div
                            key={g.id}
                            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                              isOwn
                                ? "border-primary/30 bg-primary/5"
                                : "border-border bg-secondary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    {g.employees?.full_name}
                                    {isOwn && (
                                      <span className="ml-2 text-[10px] font-semibold text-primary">(You)</span>
                                    )}
                                  </p>
                                  <GuarantorStatusBadge status={g.status || "Pending"} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {g.employees?.employee_id} · {g.employees?.department} · {g.employees?.position}
                                </p>
                              </div>
                            </div>
                            {canActOnGuarantor(g) && (g.status === "Pending" || !g.status) && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90 text-success-foreground h-8"
                                  onClick={() => handleGuarantorAction(g.id, "Approved")}
                                  disabled={updateGuarantor.isPending}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleGuarantorAction(g.id, "Rejected")}
                                  disabled={updateGuarantor.isPending}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                            {g.status === "Approved" && (
                              <p className="text-xs text-muted-foreground">
                                {g.approved_at ? new Date(g.approved_at).toLocaleDateString() : ""}
                              </p>
                            )}
                            {g.status === "Rejected" && canActOnGuarantor(g) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => handleGuarantorAction(g.id, "Approved")}
                                disabled={updateGuarantor.isPending}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Re-approve
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auto-approval notice */}
                  {allApproved && (
                    <div className="mt-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-emerald-600 font-medium">
                        ✓ All guarantors approved — loan has been automatically moved to Approved status
                      </p>
                    </div>
                  )}

                  {/* Document Button */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" onClick={() => setDocLoan(loan)}>
                      <FileText className="w-4 h-4 mr-1" /> Guarantee Approval Document
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GuaranteeApprovalDocument open={!!docLoan} onClose={() => setDocLoan(null)} loan={docLoan} />
    </div>
  );
}
