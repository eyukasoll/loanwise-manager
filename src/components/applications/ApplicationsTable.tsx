import React from "react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { fmt } from "@/lib/currency";

interface Props {
  filtered: any[];
  onSelect: (loan: any) => void;
}

export default function ApplicationsTable({ filtered, onSelect }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {["ID", "Date", "Employee", "Loan Type", "Amount", "Period", "Installment", "Status", ""].map(h => (
                <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${["Amount", "Installment"].includes(h) ? "text-right" : "text-left"} ${h === "" ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((loan: any) => (
              <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-3 font-mono text-xs">{loan.application_number}</td>
                <td className="px-5 py-3 text-muted-foreground">{loan.application_date}</td>
                <td className="px-5 py-3 font-medium">{loan.employees?.full_name}</td>
                <td className="px-5 py-3 text-muted-foreground">{loan.loan_types?.name}</td>
                <td className="px-5 py-3 text-right font-medium">{fmt(loan.requested_amount)}</td>
                <td className="px-5 py-3">{loan.repayment_period_months}m</td>
                <td className="px-5 py-3 text-right">{loan.monthly_installment ? fmt(loan.monthly_installment) : "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                <td className="px-5 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => onSelect(loan)}><Eye className="w-4 h-4" /></Button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">No applications found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
