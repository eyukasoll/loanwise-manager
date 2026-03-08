import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldOff, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt } from "@/lib/currency";
import { toast } from "sonner";
import GuaranteeDeactivationCertificate from "@/components/applications/GuaranteeDeactivationCertificate";

function useAllGuarantees() {
  return useQuery({
    queryKey: ["all_guarantees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_guarantors")
        .select("*, employees(full_name, employee_id, department), loan_applications(application_number, status, requested_amount, employees(full_name, employee_id), loan_types(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

const ACTIVE_STATUSES = ["Submitted", "Under Review", "Pending Approval", "Approved", "Disbursed", "Active"];

export default function GuaranteeDeactivation() {
  const { data: guarantees = [], isLoading } = useAllGuarantees();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [certData, setCertData] = useState<{ loan: any; guarantor: any } | null>(null);

  const getGuaranteeStatus = (loanStatus: string) => {
    if (["Closed", "Cancelled", "Rejected"].includes(loanStatus)) return "Eligible";
    if (ACTIVE_STATUSES.includes(loanStatus)) return "Active";
    return "Active";
  };

  const filtered = guarantees.filter((g: any) => {
    const gName = g.employees?.full_name || "";
    const borrower = g.loan_applications?.employees?.full_name || "";
    const appNum = g.loan_applications?.application_number || "";
    const matchSearch = gName.toLowerCase().includes(search.toLowerCase()) ||
      borrower.toLowerCase().includes(search.toLowerCase()) ||
      appNum.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "all") return matchSearch;
    const status = getGuaranteeStatus(g.loan_applications?.status || "");
    return matchSearch && status === statusFilter;
  });

  const handleRelease = async (g: any) => {
    if (!confirm(`Release ${g.employees?.full_name} from guarantee on ${g.loan_applications?.application_number}?`)) return;
    const { error } = await supabase.from("loan_guarantors").delete().eq("id", g.id);
    if (error) {
      toast.error("Failed to release guarantor");
      return;
    }
    toast.success(`${g.employees?.full_name} released from guarantee`);
    queryClient.invalidateQueries({ queryKey: ["all_guarantees"] });
    queryClient.invalidateQueries({ queryKey: ["guaranteed_employee_ids"] });
    // Show certificate
    setCertData({ loan: g.loan_applications, guarantor: g });
  };

  return (
    <div>
      <TopBar title="Guarantee Deactivation" subtitle="Manage and release employee guarantees" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guarantor or borrower..." className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-72" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guarantees</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Eligible">Eligible for Release</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium">Active</span>
            <span>= Loan in progress</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium ml-2">Eligible</span>
            <span>= Ready for release</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading guarantees...</div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Guarantor</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Employee ID</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Department</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Loan App #</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Borrower</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Loan Type</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Loan Status</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Guarantee</th>
                    <th className="text-center px-5 py-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g: any) => {
                    const loanStatus = g.loan_applications?.status || "—";
                    const gStatus = getGuaranteeStatus(loanStatus);
                    const isEligible = gStatus === "Eligible";
                    return (
                      <tr key={g.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3 font-medium">{g.employees?.full_name}</td>
                        <td className="px-5 py-3 font-mono text-xs">{g.employees?.employee_id}</td>
                        <td className="px-5 py-3 text-muted-foreground">{g.employees?.department}</td>
                        <td className="px-5 py-3 font-mono text-xs">{g.loan_applications?.application_number}</td>
                        <td className="px-5 py-3">{g.loan_applications?.employees?.full_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{g.loan_applications?.loan_types?.name}</td>
                        <td className="px-5 py-3 text-right font-medium">{g.loan_applications?.requested_amount ? fmt(g.loan_applications.requested_amount) : "—"}</td>
                        <td className="px-5 py-3"><StatusBadge status={loanStatus} /></td>
                        <td className="px-5 py-3">
                          {isEligible ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Eligible</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Active</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setCertData({ loan: g.loan_applications, guarantor: g })}
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" /> Certificate
                            </Button>
                            {isEligible && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleRelease(g)}
                              >
                                <ShieldOff className="w-3.5 h-3.5 mr-1" /> Release
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="px-5 py-12 text-center text-muted-foreground">No guarantees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Deactivation Certificate */}
      {certData && (
        <GuaranteeDeactivationCertificate
          open={!!certData}
          onClose={() => setCertData(null)}
          loan={certData.loan}
          guarantor={certData.guarantor}
        />
      )}
    </div>
  );
}
