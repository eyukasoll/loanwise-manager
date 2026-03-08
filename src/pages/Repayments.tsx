import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { loanApplications, generateRepaymentSchedule } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function Repayments() {
  const activeLoans = loanApplications.filter(l => ["Active", "Disbursed"].includes(l.status));
  const [selectedLoanId, setSelectedLoanId] = useState(activeLoans[0]?.id || "");
  const selectedLoan = loanApplications.find(l => l.id === selectedLoanId);
  const schedule = selectedLoan ? generateRepaymentSchedule(selectedLoan) : [];

  return (
    <div>
      <TopBar title="Repayment Schedule" subtitle="View loan repayment schedules" />
      <div className="p-6 animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Select Loan:</label>
          <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
            <SelectTrigger className="w-96 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {activeLoans.map(l => (
                <SelectItem key={l.id} value={l.id}>{l.id} — {l.employeeName} ({l.loanType})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLoan && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              ["Principal", fmt(selectedLoan.approvedAmount || 0)],
              ["Total Payable", fmt(selectedLoan.totalPayable || 0)],
              ["Total Paid", fmt(selectedLoan.totalPaid)],
              ["Outstanding", fmt(selectedLoan.outstandingBalance || 0)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="stat-card">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold font-display mt-1">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["#", "Due Date", "Beginning Bal.", "Installment", "Principal", "Interest", "Paid", "Remaining", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs text-right first:text-left last:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map(item => (
                  <tr key={item.installmentNo} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-left">{item.installmentNo}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.dueDate}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.beginningBalance)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(item.monthlyInstallment)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.principalPortion)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.interestPortion)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.paidAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(item.remainingBalance)}</td>
                    <td className="px-4 py-3 text-left"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
