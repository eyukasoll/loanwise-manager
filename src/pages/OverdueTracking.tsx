import React from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { loanApplications } from "@/data/mockData";
import { AlertTriangle, Clock, Ban } from "lucide-react";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function OverdueTracking() {
  // Simulating some overdue data
  const overdueLoans = loanApplications
    .filter(l => l.status === "Active")
    .map(l => ({
      ...l,
      overdueDays: Math.floor(Math.random() * 30),
      missedInstallments: Math.floor(Math.random() * 3),
    }))
    .filter(l => l.overdueDays > 5);

  return (
    <div>
      <TopBar title="Overdue Tracking" subtitle="Monitor overdue and defaulting loans" />
      <div className="p-6 animate-fade-in space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Overdue Loans" value={overdueLoans.length} icon={AlertTriangle} variant="destructive" />
          <StatCard label="Total Overdue Amount" value={fmt(overdueLoans.reduce((s, l) => s + (l.monthlyInstallment || 0) * l.missedInstallments, 0))} icon={Clock} variant="warning" />
          <StatCard label="Blocked Employees" value={overdueLoans.filter(l => l.overdueDays > 15).length} icon={Ban} variant="destructive" />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Loan ID", "Employee", "Department", "Loan Type", "Outstanding", "Overdue Days", "Missed", "Status"].map(h => (
                    <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${["Outstanding"].includes(h) ? "text-right" : "text-left"} ${["Overdue Days", "Missed"].includes(h) ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueLoans.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No overdue loans found</td></tr>
                ) : overdueLoans.map(l => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{l.id}</td>
                    <td className="px-5 py-3 font-medium">{l.employeeName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.department}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.loanType}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(l.outstandingBalance || 0)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-bold ${l.overdueDays > 15 ? "text-destructive" : "text-warning"}`}>{l.overdueDays}</span>
                    </td>
                    <td className="px-5 py-3 text-center">{l.missedInstallments}</td>
                    <td className="px-5 py-3"><StatusBadge status={l.overdueDays > 15 ? "Overdue" : "Active"} /></td>
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
