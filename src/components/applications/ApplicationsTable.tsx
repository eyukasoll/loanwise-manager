import React, { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { fmt } from "@/lib/currency";
import { Checkbox } from "@/components/ui/checkbox";
import LoanApplicationDocument from "./LoanApplicationDocument";
import TablePagination, { usePagination } from "@/components/TablePagination";

interface Props {
  filtered: any[];
  onSelect: (loan: any) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}

export default function ApplicationsTable({ filtered, onSelect, selectedIds, onToggleSelect, onToggleAll }: Props) {
  const allSelected = filtered.length > 0 && filtered.every(l => selectedIds.has(l.id));
  const [docLoan, setDocLoan] = useState<any>(null);
  const { paginatedItems, currentPage, pageSize, totalItems, startIndex, setCurrentPage, setPageSize } = usePagination(filtered);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-3 py-3 w-10">
                <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground text-xs text-left w-10">#</th>
              {["ID", "Date", "Employee", "Loan Type", "Amount", "Period", "Installment", "Status", ""].map(h => (
                <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${["Amount", "Installment"].includes(h) ? "text-right" : "text-left"} ${h === "" ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((loan: any, idx: number) => (
              <tr key={loan.id} className={`border-b border-border/50 hover:bg-secondary/20 transition-colors ${selectedIds.has(loan.id) ? "bg-primary/5" : ""}`}>
                <td className="px-3 py-3">
                  <Checkbox checked={selectedIds.has(loan.id)} onCheckedChange={() => onToggleSelect(loan.id)} />
                </td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{startIndex + idx + 1}</td>
                <td className="px-5 py-3 font-mono text-xs">{loan.application_number}</td>
                <td className="px-5 py-3 text-muted-foreground">{loan.application_date}</td>
                <td className="px-5 py-3 font-medium">{loan.employees?.full_name}</td>
                <td className="px-5 py-3 text-muted-foreground">{loan.loan_types?.name}</td>
                <td className="px-5 py-3 text-right font-medium">{fmt(loan.requested_amount)}</td>
                <td className="px-5 py-3">{loan.repayment_period_months}m</td>
                <td className="px-5 py-3 text-right">{loan.monthly_installment ? fmt(loan.monthly_installment) : "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                <td className="px-5 py-3 text-center">
                  <Button variant="ghost" size="icon" onClick={() => setDocLoan(loan)} title="Document"><FileText className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onSelect(loan)} title="View"><Eye className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11} className="px-5 py-12 text-center text-muted-foreground">No applications found.</td></tr>}
          </tbody>
        </table>
      </div>
      <TablePagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
      <LoanApplicationDocument open={!!docLoan} onClose={() => setDocLoan(null)} loan={docLoan} />
    </div>
  );
}
