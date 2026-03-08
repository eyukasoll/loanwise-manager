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
import ApplicationsTable from "@/components/applications/ApplicationsTable";
import ApplicationDetailDialog from "@/components/applications/ApplicationDetailDialog";
import NewApplicationDialog from "@/components/applications/NewApplicationDialog";

export default function Applications() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: applications = [], isLoading } = useLoanApplications(statusFilter);
  const { data: employees = [] } = useEmployees();
  const { data: loanTypesData = [] } = useLoanTypes();
  const { data: savingsData = [] } = useSavingsTransactions();
  const createMut = useCreateLoanApplication();
  const { canCreate } = usePermissions();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [savingsMultiplier, setSavingsMultiplier] = useState(3);
  const [form, setForm] = useState({
    employee_id: "", loan_type_id: "", requested_amount: 0,
    repayment_period_months: 12, purpose: "", proposed_start_date: "", remarks: "",
    guarantor1_id: "", guarantor2_id: "",
  });

  useEffect(() => {
    supabase.from("company_settings").select("savings_multiplier").limit(1).single().then(({ data }) => {
      if (data && (data as any).savings_multiplier) setSavingsMultiplier(Number((data as any).savings_multiplier));
    });
  }, []);

  const employeeSavingsBalance = useMemo(() => {
    const map = new Map<string, number>();
    savingsData.forEach((t: any) => {
      const curr = map.get(t.employee_id) || 0;
      map.set(t.employee_id, t.transaction_type === "Deposit" ? curr + Number(t.amount) : curr - Number(t.amount));
    });
    return map;
  }, [savingsData]);

  const selectedLoanType = loanTypesData.find((t: any) => t.id === form.loan_type_id);
  const isSavingsBased = selectedLoanType?.is_savings_based;
  const savingsBalance = employeeSavingsBalance.get(form.employee_id) || 0;
  const savingsMaxAmount = isSavingsBased ? savingsBalance * savingsMultiplier : null;

  useEffect(() => {
    if (isSavingsBased && form.employee_id) {
      setForm(f => ({ ...f, requested_amount: savingsBalance * savingsMultiplier }));
    }
  }, [isSavingsBased, form.employee_id, savingsBalance, savingsMultiplier]);

  // Filter guarantor options: exclude the applicant and the other selected guarantor
  const guarantorOptions1 = employees.filter((e: any) => e.id !== form.employee_id && e.id !== form.guarantor2_id);
  const guarantorOptions2 = employees.filter((e: any) => e.id !== form.employee_id && e.id !== form.guarantor1_id);

  const filtered = applications.filter((l: any) => {
    const name = l.employees?.full_name || "";
    return name.toLowerCase().includes(search.toLowerCase()) || l.application_number.toLowerCase().includes(search.toLowerCase());
  });

  const statuses = ["all", "Draft", "Submitted", "Under Review", "Pending Approval", "Approved", "Rejected", "Disbursed", "Active", "Overdue", "Closed", "Cancelled"];

  const handleCreate = () => {
    if (!form.employee_id || !form.loan_type_id || form.requested_amount <= 0) return;
    if (!form.guarantor1_id || !form.guarantor2_id) return;
    if (isSavingsBased && savingsMaxAmount !== null && form.requested_amount > savingsMaxAmount) return;
    const lt = loanTypesData.find((t: any) => t.id === form.loan_type_id);
    const rate = lt?.interest_rate || 0;
    const principal = form.requested_amount;
    const totalInterest = principal * (rate / 100) * (form.repayment_period_months / 12);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = Math.ceil(totalPayable / form.repayment_period_months);

    createMut.mutate({
      employee_id: form.employee_id,
      loan_type_id: form.loan_type_id,
      requested_amount: form.requested_amount,
      repayment_period_months: form.repayment_period_months,
      purpose: form.purpose,
      proposed_start_date: form.proposed_start_date,
      remarks: form.remarks,
      interest_rate: rate,
      status: "Submitted",
      total_payable: totalPayable,
      monthly_installment: monthlyInstallment,
      outstanding_balance: totalPayable,
      guarantor_ids: [form.guarantor1_id, form.guarantor2_id],
    }, {
      onSuccess: () => {
        setFormOpen(false);
        setForm({ employee_id: "", loan_type_id: "", requested_amount: 0, repayment_period_months: 12, purpose: "", proposed_start_date: "", remarks: "", guarantor1_id: "", guarantor2_id: "" });
      }
    });
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
          <ApplicationsTable filtered={filtered} onSelect={setSelected} />
        )}
      </div>

      <ApplicationDetailDialog selected={selected} onClose={() => setSelected(null)} />

      {/* New Application */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Loan Application</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee <span className="text-destructive">*</span></Label>
              <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v, guarantor1_id: f.guarantor1_id === v ? "" : f.guarantor1_id, guarantor2_id: f.guarantor2_id === v ? "" : f.guarantor2_id }))}>
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
              {isSavingsBased && form.employee_id && (
                <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-primary">Savings-Based Loan</p>
                  <p className="text-muted-foreground mt-0.5">
                    Savings Balance: <strong>{fmt(savingsBalance)}</strong> × {savingsMultiplier} = Max <strong>{fmt(savingsMaxAmount || 0)}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount ({CURRENCY}) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.requested_amount || ""} onChange={e => setForm(f => ({ ...f, requested_amount: Number(e.target.value) }))} className="mt-1" readOnly={!!isSavingsBased} />
                {isSavingsBased && savingsMaxAmount !== null && form.requested_amount > savingsMaxAmount && (
                  <p className="text-xs text-destructive mt-1">Amount exceeds max allowed ({fmt(savingsMaxAmount)})</p>
                )}
              </div>
              <div><Label>Period (months)</Label><Input type="number" value={form.repayment_period_months} onChange={e => setForm(f => ({ ...f, repayment_period_months: Number(e.target.value) }))} className="mt-1" /></div>
            </div>

            {/* Guarantors - Mandatory */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-3">
              <p className="font-medium text-sm text-amber-700 dark:text-amber-400">Guarantors (2 required) <span className="text-destructive">*</span></p>
              <div>
                <Label className="text-xs">Guarantor 1 <span className="text-destructive">*</span></Label>
                <Select value={form.guarantor1_id} onValueChange={v => setForm(f => ({ ...f, guarantor1_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select first guarantor" /></SelectTrigger>
                  <SelectContent>
                    {guarantorOptions1.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.employee_id} — {e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Guarantor 2 <span className="text-destructive">*</span></Label>
                <Select value={form.guarantor2_id} onValueChange={v => setForm(f => ({ ...f, guarantor2_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select second guarantor" /></SelectTrigger>
                  <SelectContent>
                    {guarantorOptions2.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.employee_id} — {e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(!form.guarantor1_id || !form.guarantor2_id) && form.employee_id && (
                <p className="text-xs text-destructive">Both guarantors are required to submit the application</p>
              )}
            </div>

            <div><Label>Purpose</Label><Textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} rows={2} className="mt-1" /></div>
            <div><Label>Proposed Start Date</Label><Input type="date" value={form.proposed_start_date} onChange={e => setForm(f => ({ ...f, proposed_start_date: e.target.value }))} className="mt-1" /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending || !form.guarantor1_id || !form.guarantor2_id}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
