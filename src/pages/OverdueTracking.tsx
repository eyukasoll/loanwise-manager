import React from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { useLoanApplications } from "@/hooks/useLoans";
import { useLanguage } from "@/i18n/LanguageContext";
import { AlertTriangle, Clock, Ban } from "lucide-react";
import { fmt } from "@/lib/currency";

export default function OverdueTracking() {
  const { t } = useLanguage();
  const { data: applications = [], isLoading } = useLoanApplications();

  const activeLoans = applications.filter((l: any) => ["Active", "Disbursed"].includes(l.status));
  const overdueLoans = activeLoans.filter((l: any) => {
    if (!l.next_due_date) return false;
    return new Date(l.next_due_date) < new Date();
  }).map((l: any) => {
    const overdueDays = Math.floor((Date.now() - new Date(l.next_due_date).getTime()) / (1000 * 60 * 60 * 24));
    return { ...l, overdueDays };
  });

  return (
    <div>
      <TopBar title={t.odTitle} subtitle={t.odSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label={t.overdueLoans} value={overdueLoans.length} icon={AlertTriangle} variant="destructive" />
          <StatCard label={t.totalOverdueAmount} value={fmt(overdueLoans.reduce((s: number, l: any) => s + (l.monthly_installment || 0), 0))} icon={Clock} variant="warning" />
          <StatCard label={t.blockedEmployees} value={overdueLoans.filter((l: any) => l.overdueDays > 15).length} icon={Ban} variant="destructive" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {[t.loanId, t.employee, t.department, t.loanType, t.outstanding, t.overdueDays, t.nextDue, t.status].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${[t.outstanding].includes(h) ? "text-right" : "text-left"} ${h === t.overdueDays ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No overdue loans found</td></tr>
                  ) : overdueLoans.map((l: any) => (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs">{l.application_number}</td>
                      <td className="px-5 py-3 font-medium">{l.employees?.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{l.employees?.department}</td>
                      <td className="px-5 py-3 text-muted-foreground">{l.loan_types?.name}</td>
                      <td className="px-5 py-3 text-right font-medium">{fmt(l.outstanding_balance || 0)}</td>
                      <td className="px-5 py-3 text-center"><span className={`font-bold ${l.overdueDays > 15 ? "text-destructive" : "text-warning"}`}>{l.overdueDays}</span></td>
                      <td className="px-5 py-3 text-muted-foreground">{l.next_due_date}</td>
                      <td className="px-5 py-3"><StatusBadge status={l.overdueDays > 15 ? "Overdue" : "Active"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
