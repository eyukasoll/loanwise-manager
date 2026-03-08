import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useUpdateLoanApplication, useGenerateRepaymentSchedule } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { useLanguage } from "@/i18n/LanguageContext";
import { Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt } from "@/lib/currency";
import { toast } from "sonner";

export default function Disbursements() {
  const { t } = useLanguage();
  const { data: applications = [], isLoading } = useLoanApplications();
  const updateMut = useUpdateLoanApplication();
  const genSchedule = useGenerateRepaymentSchedule();
  const { canCreate } = usePermissions();
  const [disburseOpen, setDisburseOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [disbForm, setDisbForm] = useState({ date: new Date().toISOString().split("T")[0], method: "Bank Transfer", voucher: "", disbursed_by: "" });

  const approved = applications.filter((l: any) => l.status === "Approved");
  const disbursed = applications.filter((l: any) => ["Active", "Disbursed", "Closed"].includes(l.status));

  const openDisburse = (loan: any) => { setSelectedLoan(loan); setDisburseOpen(true); };

  const handleDisburse = () => {
    if (!selectedLoan) return;
    updateMut.mutate({
      id: selectedLoan.id,
      status: "Active",
      disbursement_date: disbForm.date,
      disbursement_method: disbForm.method,
      disbursement_voucher: disbForm.voucher,
      disbursed_by: disbForm.disbursed_by,
      next_due_date: (() => { const d = new Date(disbForm.date); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; })(),
    }, {
      onSuccess: () => {
        // Generate repayment schedule
        genSchedule.mutate({
          id: selectedLoan.id,
          approved_amount: selectedLoan.approved_amount || selectedLoan.requested_amount,
          total_payable: selectedLoan.total_payable || selectedLoan.requested_amount,
          repayment_period_months: selectedLoan.repayment_period_months,
          monthly_installment: selectedLoan.monthly_installment,
          interest_rate: selectedLoan.interest_rate,
          disbursement_date: disbForm.date,
        });
        toast.success("Loan disbursed successfully");
        setDisburseOpen(false);
      }
    });
  };

  return (
    <div>
      <TopBar title={t.disTitle} subtitle={t.disSubtitle} />
      <div className="p-6 animate-fade-in space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {approved.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-sm mb-3">{t.pendingDisbursement} ({approved.length})</h3>
                <div className="space-y-3">
                  {approved.map((loan: any) => (
                    <div key={loan.id} className="bg-card rounded-xl border-2 border-dashed border-warning/40 p-5 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-medium">{loan.employees?.full_name} <span className="text-muted-foreground text-sm ml-2">{loan.application_number}</span></p>
                        <p className="text-sm text-muted-foreground">{loan.loan_types?.name} · {fmt(loan.approved_amount || loan.requested_amount)}</p>
                      </div>
                      {canCreate("Disbursements") && <Button size="sm" onClick={() => openDisburse(loan)}><Banknote className="w-4 h-4 mr-1" /> {t.disburse}</Button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-display font-semibold text-sm mb-3">{t.disbursementHistory}</h3>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        {["ID", t.employee, t.loanType, t.amount, t.disbursedOn, t.method, t.status].map(h => (
                          <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === t.amount ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {disbursed.map((loan: any) => (
                        <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs">{loan.application_number}</td>
                          <td className="px-5 py-3 font-medium">{loan.employees?.full_name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{loan.loan_types?.name}</td>
                          <td className="px-5 py-3 text-right font-medium">{fmt(loan.approved_amount || loan.requested_amount)}</td>
                          <td className="px-5 py-3 text-muted-foreground">{loan.disbursement_date || "—"}</td>
                          <td className="px-5 py-3 text-muted-foreground">{loan.disbursement_method || "—"}</td>
                          <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                        </tr>
                      ))}
                      {disbursed.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No disbursements yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={disburseOpen} onOpenChange={setDisburseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.disburseLoan}</DialogTitle></DialogHeader>
          {selectedLoan && (
            <div className="space-y-3">
              <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                <p><strong>{selectedLoan.employees?.full_name}</strong> — {selectedLoan.application_number}</p>
                <p className="text-muted-foreground">{selectedLoan.loan_types?.name} · {fmt(selectedLoan.approved_amount || selectedLoan.requested_amount)}</p>
              </div>
              <div><Label>Disbursement Date</Label><Input type="date" value={disbForm.date} onChange={e => setDisbForm(f => ({ ...f, date: e.target.value }))} className="mt-1" /></div>
              <div><Label>Payment Method</Label>
                <Select value={disbForm.method} onValueChange={v => setDisbForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Voucher No.</Label><Input value={disbForm.voucher} onChange={e => setDisbForm(f => ({ ...f, voucher: e.target.value }))} className="mt-1" /></div>
              <div><Label>Disbursed By</Label><Input value={disbForm.disbursed_by} onChange={e => setDisbForm(f => ({ ...f, disbursed_by: e.target.value }))} className="mt-1" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisburseOpen(false)}>Cancel</Button>
            <Button onClick={handleDisburse} disabled={updateMut.isPending || genSchedule.isPending}>Confirm Disbursement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
