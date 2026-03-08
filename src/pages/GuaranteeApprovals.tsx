import React, { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useUpdateGuarantor } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { FileText, ShieldCheck, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import GuaranteeApprovalDocument from "@/components/applications/GuaranteeApprovalDocument";

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
  const { data: applications = [], isLoading } = useLoanApplications();
  const { canEdit } = usePermissions();
  const updateGuarantor = useUpdateGuarantor();
  const [search, setSearch] = useState("");
  const [docLoan, setDocLoan] = useState<any>(null);

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

  // Show loans that have guarantors assigned
  const loansWithGuarantors = applications.filter(
    (loan: any) => guarantorsByLoan.has(loan.id)
  );

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
        approved_by: "Current User",
        approved_at: new Date().toISOString(),
      },
      {
        onSuccess: () => toast.success(`Guarantor ${action.toLowerCase()} successfully`),
      }
    );
  };

  return (
    <div>
      <TopBar title="Guarantee Approvals" subtitle="Review and approve guarantors assigned to loan applications" />
      <div className="p-6 animate-fade-in">
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
            <h3 className="font-display font-semibold text-lg">No Guarantee Records</h3>
            <p className="text-muted-foreground text-sm mt-1">No loan applications with assigned guarantors found.</p>
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
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Assigned Guarantors</p>
                    <div className="space-y-2">
                      {guarantors.map((g: any, i: number) => (
                        <div key={g.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{g.employees?.full_name}</p>
                                <GuarantorStatusBadge status={g.status || "Pending"} />
                              </div>
                              <p className="text-xs text-muted-foreground">{g.employees?.employee_id} · {g.employees?.department} · {g.employees?.position}</p>
                            </div>
                          </div>
                          {canEdit("Approvals") && (g.status === "Pending" || !g.status) && (
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
                          {g.status === "Rejected" && canEdit("Approvals") && (
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
                      ))}
                    </div>
                  </div>

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
