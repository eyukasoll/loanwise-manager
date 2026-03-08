import React, { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import { useEmployees } from "@/hooks/useLoans";
import { useSavingsTransactions, useCreateSavingsTransaction, useDeleteSavingsTransaction, useBulkCreateSavingsTransactions } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { PiggyBank, Plus, Upload, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, CURRENCY } from "@/lib/currency";
import StatCard from "@/components/StatCard";
import BulkSavingsImport from "@/components/BulkSavingsImport";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Savings() {
  const { t } = useLanguage();
  const { data: transactions = [], isLoading } = useSavingsTransactions();
  const { data: employees = [] } = useEmployees();
  const createMut = useCreateSavingsTransaction();
  const deleteMut = useDeleteSavingsTransaction();
  const bulkMut = useBulkCreateSavingsTransactions();
  const { canCreate, canDelete } = usePermissions();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<any>(null);
  const [form, setForm] = useState({
    employee_id: "", savings_type: "Voluntary", transaction_type: "Deposit",
    amount: 0, payment_method: "Cash", receipt_number: "", remarks: "",
  });

  const employeeIdMap = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e: any) => m.set(e.employee_id, e.id));
    return m;
  }, [employees]);

  const employeeIdSet = useMemo(() => new Set(employees.map((e: any) => e.employee_id)), [employees]);

  // Summary stats
  const totalDeposits = transactions.filter((t: any) => t.transaction_type === "Deposit").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter((t: any) => t.transaction_type === "Withdrawal").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const netBalance = totalDeposits - totalWithdrawals;

  const handleSave = () => {
    if (!form.employee_id || form.amount <= 0) return;
    createMut.mutate({
      employee_id: form.employee_id,
      savings_type: form.savings_type,
      transaction_type: form.transaction_type,
      amount: form.amount,
      payment_method: form.payment_method,
      receipt_number: form.receipt_number || undefined,
      remarks: form.remarks || undefined,
    }, {
      onSuccess: () => {
        setFormOpen(false);
        setForm({ employee_id: "", savings_type: "Voluntary", transaction_type: "Deposit", amount: 0, payment_method: "Cash", receipt_number: "", remarks: "" });
      },
    });
  };

  const handleBulkImport = async (rows: Array<{ employee_id_text: string; savings_type: string; transaction_type: string; amount: number; payment_method: string; receipt_number: string; remarks: string }>) => {
    const mapped = rows.map(r => ({
      employee_id: employeeIdMap.get(r.employee_id_text)!,
      savings_type: r.savings_type,
      transaction_type: r.transaction_type,
      amount: r.amount,
      payment_method: r.payment_method,
      receipt_number: r.receipt_number || undefined,
      remarks: r.remarks || undefined,
    }));
    await bulkMut.mutateAsync(mapped);
  };

  const printReceipt = (tx: any) => {
    setReceiptTx(tx);
    setTimeout(() => {
      const el = document.getElementById("savings-receipt");
      if (!el) return;
      const w = window.open("", "_blank", "width=400,height=600");
      if (!w) return;
      w.document.write(`<html><head><title>Savings Receipt</title><style>
        body { font-family: sans-serif; padding: 24px; font-size: 13px; }
        h2 { text-align: center; margin-bottom: 4px; }
        .sub { text-align: center; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 6px 4px; border-bottom: 1px solid #eee; }
        td:first-child { color: #666; width: 40%; }
        .footer { margin-top: 24px; text-align: center; color: #999; font-size: 11px; }
      </style></head><body>${el.innerHTML}</body></html>`);
      w.document.close();
      w.print();
      setReceiptTx(null);
    }, 100);
  };

  return (
    <div>
      <TopBar title={t.savTitle} subtitle={t.savSubtitle} />
      <div className="p-6 animate-fade-in space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Deposits" value={fmt(totalDeposits)} icon={PiggyBank} variant="primary" />
          <StatCard label="Total Withdrawals" value={fmt(totalWithdrawals)} icon={PiggyBank} variant="warning" />
          <StatCard label="Net Balance" value={fmt(netBalance)} icon={PiggyBank} variant="accent" />
        </div>

        {/* Actions */}
        {canCreate("Savings") && (
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-1" /> Import CSV
            </Button>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> New Transaction
            </Button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{t.loading}</div>
        ) : transactions.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold text-lg">{t.noSavingsTransactions}</h3>
            <p className="text-muted-foreground text-sm mt-1">{t.savingsWillAppear}</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {[t.date, t.employee, t.empId, t.type, t.txn, t.amount, t.method, t.receipt, ""].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === t.amount ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{t.transaction_date}</td>
                      <td className="px-5 py-3 font-medium">{t.employees?.full_name}</td>
                      <td className="px-5 py-3 font-mono text-xs">{t.employees?.employee_id}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.savings_type === "Mandatory" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                          {t.savings_type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${t.transaction_type === "Deposit" ? "text-green-600" : "text-destructive"}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(t.amount)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{t.payment_method}</td>
                      <td className="px-5 py-3 font-mono text-xs">{t.receipt_number || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => printReceipt(t)} title="Print receipt">
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          {canDelete("Savings") && (
                            <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate(t.id)} title="Delete">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.recordSavingsTransaction}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t.employee} <span className="text-destructive">*</span></Label>
              <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.selectEmployee} /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e: any) => e.employment_status === "Active").map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.employee_id} — {e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Savings Type</Label>
                <Select value={form.savings_type} onValueChange={v => setForm(f => ({ ...f, savings_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Voluntary">Voluntary</SelectItem>
                    <SelectItem value="Mandatory">Mandatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction Type</Label>
                <Select value={form.transaction_type} onValueChange={v => setForm(f => ({ ...f, transaction_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Amount ({CURRENCY}) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Payroll Deduction">Payroll Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Receipt Number</Label><Input value={form.receipt_number} onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))} className="mt-1" /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import */}
      <BulkSavingsImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleBulkImport}
        employeeIds={employeeIdSet}
      />

      {/* Hidden receipt for printing */}
      {receiptTx && (
        <div id="savings-receipt" className="hidden">
          <h2>Savings Receipt</h2>
          <p className="sub">Addis Microfinance</p>
          <table>
            <tbody>
              <tr><td>Date</td><td>{receiptTx.transaction_date}</td></tr>
              <tr><td>Employee</td><td>{receiptTx.employees?.full_name}</td></tr>
              <tr><td>Employee ID</td><td>{receiptTx.employees?.employee_id}</td></tr>
              <tr><td>Type</td><td>{receiptTx.savings_type}</td></tr>
              <tr><td>Transaction</td><td>{receiptTx.transaction_type}</td></tr>
              <tr><td>Amount</td><td><strong>{fmt(receiptTx.amount)}</strong></td></tr>
              <tr><td>Method</td><td>{receiptTx.payment_method}</td></tr>
              <tr><td>Receipt #</td><td>{receiptTx.receipt_number || "—"}</td></tr>
              {receiptTx.remarks && <tr><td>Remarks</td><td>{receiptTx.remarks}</td></tr>}
            </tbody>
          </table>
          <p className="footer">Thank you for saving with us!</p>
        </div>
      )}
    </div>
  );
}
