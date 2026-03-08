import React, { useState, useMemo, useEffect } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useCreateLoanApplication, useEmployees, useLoanTypes, useSavingsTransactions } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { Search, Plus, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, CURRENCY } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

export default function Applications() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: applications = [], isLoading } = useLoanApplications(statusFilter);
  const { data: employees = [] } = useEmployees();
  const { data: loanTypesData = [] } = useLoanTypes();
  const createMut = useCreateLoanApplication();
  const { canCreate } = usePermissions();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", loan_type_id: "", requested_amount: 0,
    repayment_period_months: 12, purpose: "", proposed_start_date: "", remarks: "",
  });

  const filtered = applications.filter((l: any) => {
    const name = l.employees?.full_name || "";
    return name.toLowerCase().includes(search.toLowerCase()) || l.application_number.toLowerCase().includes(search.toLowerCase());
  });

  const statuses = ["all", "Draft", "Submitted", "Under Review", "Pending Approval", "Approved", "Rejected", "Disbursed", "Active", "Overdue", "Closed", "Cancelled"];

  const handleCreate = () => {
    if (!form.employee_id || !form.loan_type_id || form.requested_amount <= 0) return;
    const lt = loanTypesData.find((t: any) => t.id === form.loan_type_id);
    const rate = lt?.interest_rate || 0;
    const principal = form.requested_amount;
    const totalInterest = principal * (rate / 100) * (form.repayment_period_months / 12);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = Math.ceil(totalPayable / form.repayment_period_months);

    createMut.mutate({
      ...form,
      interest_rate: rate,
      status: "Submitted",
      total_payable: totalPayable,
      monthly_installment: monthlyInstallment,
      outstanding_balance: totalPayable,
    }, { onSuccess: () => { setFormOpen(false); setForm({ employee_id: "", loan_type_id: "", requested_amount: 0, repayment_period_months: 12, purpose: "", proposed_start_date: "", remarks: "" }); } });
  };

  return (
    <div>
      <TopBar title="Loan Applications" subtitle="View and manage all loan applications" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {canCreate("Applications") && <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Application</Button>}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {["ID", "Date", "Employee", "Loan Type", "Amount", "Period", "Installment", "Status", ""].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${["Amount", "Installment"].includes(h) ? "text-right" : "text-left"} ${h === "" ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan: any) => (
                    <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs">{loan.application_number}</td>
                      <td className="px-5 py-3 text-muted-foreground">{loan.application_date}</td>
                      <td className="px-5 py-3 font-medium">{loan.employees?.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{loan.loan_types?.name}</td>
                      <td className="px-5 py-3 text-right font-medium">{fmt(loan.requested_amount)}</td>
                      <td className="px-5 py-3">{loan.repayment_period_months}m</td>
                      <td className="px-5 py-3 text-right">{loan.monthly_installment ? fmt(loan.monthly_installment) : "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                      <td className="px-5 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => setSelected(loan)}><Eye className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">No applications found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Loan Application Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([
                ["Application ID", selected.application_number], ["Date", selected.application_date],
                ["Employee", selected.employees?.full_name], ["Department", selected.employees?.department],
                ["Loan Type", selected.loan_types?.name], ["Status", selected.status],
                ["Requested", fmt(selected.requested_amount)],
                ["Approved", selected.approved_amount ? fmt(selected.approved_amount) : "—"],
                ["Interest Rate", `${selected.interest_rate}%`], ["Period", `${selected.repayment_period_months} months`],
                ["Installment", selected.monthly_installment ? fmt(selected.monthly_installment) : "—"],
                ["Purpose", selected.purpose || "—"],
                ["Total Payable", selected.total_payable ? fmt(selected.total_payable) : "—"],
                ["Total Paid", fmt(selected.total_paid)],
                ["Outstanding", selected.outstanding_balance != null ? fmt(selected.outstanding_balance) : "—"],
                ["Disbursed On", selected.disbursement_date || "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}><p className="text-muted-foreground text-xs">{label}</p><p className="font-medium">{value}</p></div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Application */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Loan Application</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee <span className="text-destructive">*</span></Label>
              <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.employee_id} — {e.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Loan Type <span className="text-destructive">*</span></Label>
              <Select value={form.loan_type_id} onValueChange={v => setForm(f => ({ ...f, loan_type_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select loan type" /></SelectTrigger>
                <SelectContent>{loanTypesData.map((lt: any) => <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount ({CURRENCY}) <span className="text-destructive">*</span></Label><Input type="number" value={form.requested_amount || ""} onChange={e => setForm(f => ({ ...f, requested_amount: Number(e.target.value) }))} className="mt-1" /></div>
              <div><Label>Period (months)</Label><Input type="number" value={form.repayment_period_months} onChange={e => setForm(f => ({ ...f, repayment_period_months: Number(e.target.value) }))} className="mt-1" /></div>
            </div>
            <div><Label>Purpose</Label><Textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} rows={2} className="mt-1" /></div>
            <div><Label>Proposed Start Date</Label><Input type="date" value={form.proposed_start_date} onChange={e => setForm(f => ({ ...f, proposed_start_date: e.target.value }))} className="mt-1" /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
