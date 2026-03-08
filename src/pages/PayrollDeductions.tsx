import React from "react";
import TopBar from "@/components/TopBar";
import { loanApplications } from "@/data/mockData";
import { CreditCard } from "lucide-react";

import { fmt } from "@/lib/currency";

const deductions = loanApplications
  .filter(l => l.status === "Active" && l.monthlyInstallment)
  .map(l => ({
    ...l,
    deductionAmount: l.monthlyInstallment!,
    payrollPeriod: "August 2025",
    deductionStatus: "Scheduled",
  }));

export default function PayrollDeductions() {
  return (
    <div>
      <TopBar title="Payroll Deductions" subtitle="Monthly salary deduction schedule" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4 p-3 bg-info/10 rounded-lg border border-info/20">
          <CreditCard className="w-4 h-4 text-info" />
          <p className="text-sm text-info">Current payroll period: <strong>August 2025</strong> — {deductions.length} active deductions</p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Employee ID", "Employee", "Loan ID", "Loan Type", "Monthly Deduction", "Outstanding", "Period", "Status"].map(h => (
                    <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${["Monthly Deduction", "Outstanding"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deductions.map(d => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{d.employeeId}</td>
                    <td className="px-5 py-3 font-medium">{d.employeeName}</td>
                    <td className="px-5 py-3 font-mono text-xs">{d.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.loanType}</td>
                    <td className="px-5 py-3 text-right font-bold">{fmt(d.deductionAmount)}</td>
                    <td className="px-5 py-3 text-right">{fmt(d.outstandingBalance || 0)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.payrollPeriod}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info/10 text-info">{d.deductionStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-secondary/20 flex justify-between text-sm">
            <span className="font-medium">Total Deductions This Period</span>
            <span className="font-bold">{fmt(deductions.reduce((s, d) => s + d.deductionAmount, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
