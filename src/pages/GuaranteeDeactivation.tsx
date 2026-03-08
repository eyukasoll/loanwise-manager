import React, { useState, useRef } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldOff, Filter, UserPlus, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmt } from "@/lib/currency";
import { toast } from "sonner";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import GuaranteeDeactivationCertificate from "@/components/applications/GuaranteeDeactivationCertificate";

function useAllGuarantees() {
  return useQuery({
    queryKey: ["all_guarantees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_guarantors")
        .select("*, employees(full_name, employee_id, department, employment_status), loan_applications(application_number, status, requested_amount, employees(full_name, employee_id), loan_types(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function useEmployees() {
  return useQuery({
    queryKey: ["employees_for_guarantor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, employee_id, department, employment_status")
        .eq("employment_status", "Active")
        .order("full_name");
      if (error) throw error;
      return data || [];
    },
  });
}

const ACTIVE_STATUSES = ["Submitted", "Under Review", "Pending Approval", "Approved", "Disbursed", "Active"];

export default function GuaranteeDeactivation() {
  const { data: guarantees = [], isLoading } = useAllGuarantees();
  const { data: employees = [] } = useEmployees();
  const { settings: company } = useCompanySettings();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [releaseDialog, setReleaseDialog] = useState<any>(null);
  const [newGuarantorId, setNewGuarantorId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [releaseDoc, setReleaseDoc] = useState<any>(null);
  const [certGuarantee, setCertGuarantee] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const getGuaranteeStatus = (loanStatus: string) => {
    if (["Closed", "Cancelled", "Rejected"].includes(loanStatus)) return "Eligible";
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

  // Get existing guarantor employee IDs for this loan to exclude them
  const getExistingGuarantorIds = (loanAppId: string) => {
    return guarantees
      .filter((g: any) => g.loan_application_id === loanAppId)
      .map((g: any) => g.employee_id);
  };

  const filteredEmployees = releaseDialog
    ? employees.filter((e: any) => {
        const existingIds = getExistingGuarantorIds(releaseDialog.loan_application_id);
        // Exclude the borrower and existing guarantors
        const borrowerEmployeeId = releaseDialog.loan_applications?.employees?.employee_id;
        if (e.employee_id === borrowerEmployeeId) return false;
        if (existingIds.includes(e.id)) return false;
        if (!employeeSearch) return true;
        return e.full_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          e.employee_id.toLowerCase().includes(employeeSearch.toLowerCase());
      })
    : [];

  const selectedEmployee = employees.find((e: any) => e.id === newGuarantorId);

  const handleRelease = async () => {
    if (!releaseDialog) return;
    setReleasing(true);

    try {
      // 1. Delete the old guarantor record
      const { error: deleteError } = await supabase
        .from("loan_guarantors")
        .delete()
        .eq("id", releaseDialog.id);
      if (deleteError) throw deleteError;

      // 2. If a new guarantor is selected, insert the replacement
      if (newGuarantorId) {
        const { error: insertError } = await supabase
          .from("loan_guarantors")
          .insert({
            loan_application_id: releaseDialog.loan_application_id,
            employee_id: newGuarantorId,
          });
        if (insertError) throw insertError;
      }

      // 3. Update the old guarantor's employee status to indicate they are released
      await supabase
        .from("employees")
        .update({ employment_status: "Active" })
        .eq("id", releaseDialog.employee_id);

      // 4. Show release document
      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const refNo = `GDR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      setReleaseDoc({
        guarantor: releaseDialog.employees,
        borrower: releaseDialog.loan_applications?.employees,
        application_number: releaseDialog.loan_applications?.application_number,
        loan_type: releaseDialog.loan_applications?.loan_types?.name,
        loan_status: releaseDialog.loan_applications?.status,
        requested_amount: releaseDialog.loan_applications?.requested_amount,
        replacement: selectedEmployee || null,
        date: today,
        refNo,
      });

      toast.success(
        newGuarantorId
          ? `${releaseDialog.employees?.full_name} released and replaced by ${selectedEmployee?.full_name}`
          : `${releaseDialog.employees?.full_name} released from guarantee`
      );

      queryClient.invalidateQueries({ queryKey: ["all_guarantees"] });
      queryClient.invalidateQueries({ queryKey: ["guaranteed_employee_ids"] });
      queryClient.invalidateQueries({ queryKey: ["employees_for_guarantor"] });
      setReleaseDialog(null);
      setNewGuarantorId("");
      setEmployeeSearch("");
    } catch (error) {
      toast.error("Failed to release guarantor");
    } finally {
      setReleasing(false);
    }
  };

  const handlePrintRelease = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Guarantee Release Document</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { font-size: 16px; margin: 0; color: #555; font-weight: normal; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #888; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
        .grid .label { color: #666; }
        .grid .value { font-weight: 600; }
        .body-text { font-size: 13px; line-height: 1.7; margin: 16px 0; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; font-size: 13px; }
        .sig-line { border-top: 1px solid #333; padding-top: 6px; margin-top: 50px; }
        .stamp { text-align: center; margin-top: 40px; padding: 12px; border: 2px dashed #aaa; font-size: 12px; color: #888; }
        .ref { font-size: 11px; color: #888; margin-top: 24px; text-align: right; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>${printRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Status</th>
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
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            g.employees?.employment_status === "Active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {g.employees?.employment_status || "—"}
                          </span>
                        </td>
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
                              onClick={() => setCertGuarantee(g)}
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" /> Certificate
                            </Button>
                            {isEligible && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => {
                                  setReleaseDialog(g);
                                  setNewGuarantorId("");
                                  setEmployeeSearch("");
                                }}
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
                    <tr><td colSpan={11} className="px-5 py-12 text-center text-muted-foreground">No guarantees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Release & Replace Dialog */}
      <Dialog open={!!releaseDialog} onOpenChange={(open) => { if (!open) { setReleaseDialog(null); setNewGuarantorId(""); setEmployeeSearch(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-destructive" />
              Release Guarantor
            </DialogTitle>
          </DialogHeader>
          {releaseDialog && (
            <div className="space-y-4">
              {/* Current guarantor info */}
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Current Guarantor</p>
                <p className="font-medium">{releaseDialog.employees?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {releaseDialog.employees?.employee_id} · {releaseDialog.employees?.department}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Loan: {releaseDialog.loan_applications?.application_number} · Borrower: {releaseDialog.loan_applications?.employees?.full_name}
                </p>
              </div>

              {/* New Guarantor Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-primary" />
                  Select Replacement Guarantor (Optional)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={employeeSearch}
                    onChange={e => setEmployeeSearch(e.target.value)}
                    placeholder="Search employee by name or ID..."
                    className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {filteredEmployees.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No employees found</p>
                  ) : (
                    filteredEmployees.slice(0, 20).map((e: any) => (
                      <div
                        key={e.id}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-0 ${
                          newGuarantorId === e.id ? "bg-primary/10 border-primary/30" : ""
                        }`}
                        onClick={() => setNewGuarantorId(e.id === newGuarantorId ? "" : e.id)}
                      >
                        <div>
                          <p className="font-medium">{e.full_name}</p>
                          <p className="text-xs text-muted-foreground">{e.employee_id} · {e.department}</p>
                        </div>
                        {newGuarantorId === e.id && (
                          <span className="text-xs font-medium text-primary">Selected</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected new guarantor summary */}
              {selectedEmployee && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
                  <p className="text-xs text-primary font-medium">New Guarantor</p>
                  <p className="font-medium">{selectedEmployee.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedEmployee.employee_id} · {selectedEmployee.department}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setReleaseDialog(null); setNewGuarantorId(""); setEmployeeSearch(""); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRelease}
                  disabled={releasing}
                >
                  {releasing ? "Processing..." : newGuarantorId ? "Release & Replace" : "Release Only"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Release Document Dialog */}
      <Dialog open={!!releaseDoc} onOpenChange={(open) => { if (!open) setReleaseDoc(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Guarantee Release Document
              <Button size="sm" onClick={handlePrintRelease}><Printer className="w-4 h-4 mr-1" /> Print</Button>
            </DialogTitle>
          </DialogHeader>
          {releaseDoc && (
            <div ref={printRef}>
              <div style={{ textAlign: "center", borderBottom: "3px solid #1a1a1a", paddingBottom: 16, marginBottom: 24 }}>
                {company?.logo_url && (
                  <img src={company.logo_url} alt={company?.company_name || ""} style={{ height: 48, margin: "0 auto 8px", objectFit: "contain" as const }} />
                )}
                <h1 style={{ fontSize: 22, margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: 1 }}>{company?.company_name || "Addis Microfinance"}</h1>
                <h2 style={{ fontSize: 16, margin: 0, color: "#555", fontWeight: "normal" }}>Guarantee Release Document</h2>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>Date: {releaseDoc.date} | Ref: {releaseDoc.refNo}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Loan Application Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
                  <span style={{ color: "#666" }}>Application No:</span><span style={{ fontWeight: 600 }}>{releaseDoc.application_number}</span>
                  <span style={{ color: "#666" }}>Borrower:</span><span style={{ fontWeight: 600 }}>{releaseDoc.borrower?.full_name}</span>
                  <span style={{ color: "#666" }}>Borrower ID:</span><span style={{ fontWeight: 600 }}>{releaseDoc.borrower?.employee_id}</span>
                  <span style={{ color: "#666" }}>Loan Type:</span><span style={{ fontWeight: 600 }}>{releaseDoc.loan_type}</span>
                  <span style={{ color: "#666" }}>Loan Amount:</span><span style={{ fontWeight: 600 }}>{fmt(releaseDoc.requested_amount)}</span>
                  <span style={{ color: "#666" }}>Loan Status:</span><span style={{ fontWeight: 600 }}>{releaseDoc.loan_status}</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Released Guarantor</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
                  <span style={{ color: "#666" }}>Full Name:</span><span style={{ fontWeight: 600 }}>{releaseDoc.guarantor?.full_name}</span>
                  <span style={{ color: "#666" }}>Employee ID:</span><span style={{ fontWeight: 600 }}>{releaseDoc.guarantor?.employee_id}</span>
                  <span style={{ color: "#666" }}>Department:</span><span style={{ fontWeight: 600 }}>{releaseDoc.guarantor?.department}</span>
                </div>
              </div>

              {releaseDoc.replacement && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Replacement Guarantor</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 13 }}>
                    <span style={{ color: "#666" }}>Full Name:</span><span style={{ fontWeight: 600 }}>{releaseDoc.replacement.full_name}</span>
                    <span style={{ color: "#666" }}>Employee ID:</span><span style={{ fontWeight: 600 }}>{releaseDoc.replacement.employee_id}</span>
                    <span style={{ color: "#666" }}>Department:</span><span style={{ fontWeight: 600 }}>{releaseDoc.replacement.department}</span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 13, lineHeight: 1.7, margin: "16px 0" }}>
                This is to certify that <strong>{releaseDoc.guarantor?.full_name}</strong> (Employee ID: {releaseDoc.guarantor?.employee_id})
                has been <strong>officially released</strong> from all guarantee obligations for loan application <strong>{releaseDoc.application_number}</strong>
                taken by <strong>{releaseDoc.borrower?.full_name}</strong>.
                {releaseDoc.replacement && (
                  <> The guarantee responsibility has been transferred to <strong>{releaseDoc.replacement.full_name}</strong> (Employee ID: {releaseDoc.replacement.employee_id}).</>
                )}
                <br /><br />
                The released guarantor is no longer liable for any outstanding amounts related to this loan.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 60, fontSize: 13 }}>
                <div>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 6, marginTop: 50 }}>Authorized Officer</div>
                  <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Name & Signature</p>
                </div>
                <div>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 6, marginTop: 50 }}>Released Guarantor</div>
                  <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{releaseDoc.guarantor?.full_name}</p>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 40, padding: 12, border: "2px dashed #aaa", fontSize: 12, color: "#888" }}>
                {company?.stamp_url ? (
                  <img src={company.stamp_url} alt="Company Stamp" style={{ height: 80, margin: "0 auto", objectFit: "contain" as const }} />
                ) : (
                  "Company Stamp / Seal"
                )}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 24, textAlign: "right" }}>Reference: {releaseDoc.refNo}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivation Certificate Dialog */}
      {certGuarantee && (
        <GuaranteeDeactivationCertificate
          open={!!certGuarantee}
          onClose={() => setCertGuarantee(null)}
          loan={certGuarantee.loan_applications}
          guarantor={certGuarantee}
        />
      )}
    </div>
  );
}
