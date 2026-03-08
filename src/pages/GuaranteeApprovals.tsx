import React, { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { FileText, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import GuaranteeApprovalDocument from "@/components/applications/GuaranteeApprovalDocument";

export default function GuaranteeApprovals() {
  const { data: applications = [], isLoading } = useLoanApplications();
  const { canView } = usePermissions();
  const [search, setSearch] = useState("");
  const [docLoan, setDocLoan] = useState<any>(null);

  // Fetch all guarantors with their employee info
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
    // Also search guarantor names
    const gNames = (guarantorsByLoan.get(loan.id) || [])
      .map((g: any) => g.employees?.full_name || "")
      .join(" ");
    return (
      name.toLowerCase().includes(term) ||
      appNo.toLowerCase().includes(term) ||
      gNames.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <TopBar title="Guarantee Approvals" subtitle="Review guarantors assigned to loan applications" />
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
              return (
                <div key={loan.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display font-semibold">{loan.employees?.full_name}</h3>
                        <StatusBadge status={loan.status} />
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

                  {/* Guarantor List */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Assigned Guarantors</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {guarantors.map((g: any, i: number) => (
                        <div key={g.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{g.employees?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{g.employees?.employee_id} · {g.employees?.department}</p>
                          </div>
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
