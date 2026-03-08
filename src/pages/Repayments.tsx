import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useRepaymentSchedule } from "@/hooks/useLoans";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { fmt } from "@/lib/currency";

export default function Repayments() {
  const { data: applications = [] } = useLoanApplications();
  const activeLoans = applications.filter((l: any) => ["Active", "Disbursed"].includes(l.status));
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const selectedLoan = applications.find((l: any) => l.id === selectedLoanId);
  const { data: schedule = [], isLoading } = useRepaymentSchedule(selectedLoanId);

  // Auto-select first active loan
  React.useEffect(() => {
    if (!selectedLoanId && activeLoans.length > 0) setSelectedLoanId(activeLoans[0].id);
  }, [activeLoans, selectedLoanId]);

  return (
    <div>
      <TopBar title="Repayment Schedule" subtitle="View loan repayment schedules" />
      <div className="p-6 animate-fade-in space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Select Loan:</label>
          <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
            <SelectTrigger className="w-96 h-9"><SelectValue placeholder="Select a loan" /></SelectTrigger>
            <SelectContent>
              {activeLoans.map((l: any) => (
                <SelectItem key={l.id} value={l.id}>{l.application_number} — {l.employees?.full_name} ({l.loan_types?.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLoan && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              ["Principal", fmt(selectedLoan.approved_amount || selectedLoan.requested_amount)],
              ["Total Payable", fmt(selectedLoan.total_payable || 0)],
              ["Total Paid", fmt(selectedLoan.total_paid)],
              ["Outstanding", fmt(selectedLoan.outstanding_balance || 0)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="stat-card"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold font-display mt-1">{value}</p></div>
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
                {isLoading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Loading schedule...</td></tr>
                ) : schedule.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">{selectedLoanId ? "No repayment schedule generated yet." : "Select a loan to view schedule."}</td></tr>
                ) : schedule.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-left">{item.installment_no}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.due_date}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.beginning_balance)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(item.installment_amount)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.principal_portion)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.interest_portion)}</td>
                    <td className="px-4 py-3 text-right">{fmt(item.paid_amount)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(item.remaining_balance)}</td>
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
