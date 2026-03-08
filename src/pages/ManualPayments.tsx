import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import TablePagination, { usePagination } from "@/components/TablePagination";
import { useManualPayments, useCreateManualPayment, useLoanApplications } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { HandCoins, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, CURRENCY } from "@/lib/currency";

export default function ManualPayments() {
  const { t } = useLanguage();
  const { data: payments = [], isLoading } = useManualPayments();
  const { data: applications = [] } = useLoanApplications();
  const createMut = useCreateManualPayment();
  const { canCreate } = usePermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ loan_application_id: "", amount: 0, payment_method: "Cash", receipt_number: "", received_by: "", remarks: "" });

  const activeLoans = applications.filter((l: any) => ["Active", "Disbursed"].includes(l.status));

  const handleSave = () => {
    if (!form.loan_application_id || form.amount <= 0) return;
    createMut.mutate(form, {
      onSuccess: () => { setFormOpen(false); setForm({ loan_application_id: "", amount: 0, payment_method: "Cash", receipt_number: "", received_by: "", remarks: "" }); },
    });
  };

  return (
    <div>
      <TopBar title={t.mpTitle} subtitle={t.mpSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in">
        {canCreate("Manual Payments") && (
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="w-4 h-4 mr-1" /> {t.recordPayment}</Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <HandCoins className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold text-lg">{t.noManualPayments}</h3>
            <p className="text-muted-foreground text-sm mt-1">{t.manualPaymentsWillAppear}</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {[t.date, t.employee, t.loanId, t.amount, t.method, t.receipt, t.receivedBy].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === t.amount ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{p.payment_date}</td>
                      <td className="px-5 py-3 font-medium">{p.loan_applications?.employees?.full_name}</td>
                      <td className="px-5 py-3 font-mono text-xs">{p.loan_applications?.application_number}</td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(p.amount)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.payment_method}</td>
                      <td className="px-5 py-3 font-mono text-xs">{p.receipt_number || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.received_by || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.recordManualPayment}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Loan <span className="text-destructive">*</span></Label>
              <Select value={form.loan_application_id} onValueChange={v => setForm(f => ({ ...f, loan_application_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select loan" /></SelectTrigger>
                <SelectContent>{activeLoans.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.application_number} — {l.employees?.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Amount ({CURRENCY}) <span className="text-destructive">*</span></Label><Input type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className="mt-1" /></div>
            <div><Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Receipt Number</Label><Input value={form.receipt_number} onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))} className="mt-1" /></div>
            <div><Label>Received By</Label><Input value={form.received_by} onChange={e => setForm(f => ({ ...f, received_by: e.target.value }))} className="mt-1" /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMut.isPending}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
