import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import { useLoanApplications, usePayrollDeductions, useGeneratePayrollDeductions, useProcessDeduction } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { CreditCard, RefreshCw, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt } from "@/lib/currency";
import StatusBadge from "@/components/StatusBadge";

export default function PayrollDeductions() {
  const { t } = useLanguage();
  const now = new Date();
  const defaultPeriod = `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  const [period, setPeriod] = useState(defaultPeriod);
  const { data: deductions = [], isLoading } = usePayrollDeductions(period);
  const generateMut = useGeneratePayrollDeductions();
  const processMut = useProcessDeduction();
  const { canCreate, canEdit } = usePermissions();

  const total = deductions.reduce((s: number, d: any) => s + d.deduction_amount, 0);
  const scheduled = deductions.filter((d: any) => d.status === "Scheduled");
  const processed = deductions.filter((d: any) => d.status === "Processed");

  return (
    <div>
      <TopBar title={t.pdTitle} subtitle={t.pdSubtitle} />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">{t.payrollPeriod}</label>
            <Input value={period} onChange={e => setPeriod(e.target.value)} className="w-48 h-9" />
          </div>
          {canCreate("Payroll Deductions") && (
            <Button size="sm" onClick={() => generateMut.mutate(period)} disabled={generateMut.isPending}>
              <RefreshCw className="w-4 h-4 mr-1" /> {t.generateDeductions}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-info/10 rounded-lg border border-info/20">
          <CreditCard className="w-4 h-4 text-info" />
          <p className="text-sm text-info">Period: <strong>{period}</strong> — {deductions.length} deductions ({scheduled.length} scheduled, {processed.length} processed)</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {["Employee", "Loan ID", "Loan Type", "Deduction Amount", "Status", "Action"].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Deduction Amount" ? "text-right" : "text-left"} ${h === "Action" ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((d: any) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{d.loan_applications?.employees?.full_name}</td>
                      <td className="px-5 py-3 font-mono text-xs">{d.loan_applications?.application_number}</td>
                      <td className="px-5 py-3 text-muted-foreground">{d.loan_applications?.loan_types?.name}</td>
                      <td className="px-5 py-3 text-right font-bold">{fmt(d.deduction_amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-3 text-center">
                        {d.status === "Scheduled" && canEdit("Payroll Deductions") && (
                          <Button size="sm" variant="outline" onClick={() => processMut.mutate({ id: d.id, loan_application_id: d.loan_application_id, amount: d.deduction_amount })} disabled={processMut.isPending}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Process
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deductions.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No deductions for this period. Click "Generate Deductions" to create them.</td></tr>}
                </tbody>
              </table>
            </div>
            {deductions.length > 0 && (
              <div className="p-4 border-t border-border bg-secondary/20 flex justify-between text-sm">
                <span className="font-medium">Total Deductions</span>
                <span className="font-bold">{fmt(total)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
