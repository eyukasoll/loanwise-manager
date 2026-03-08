import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { loanApplications } from "@/data/mockData";
import { Search, Plus, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function Applications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<typeof loanApplications[0] | null>(null);

  const filtered = loanApplications.filter(l => {
    const matchSearch = l.employeeName.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", ...Array.from(new Set(loanApplications.map(l => l.status)))];

  return (
    <div>
      <TopBar title="Loan Applications" subtitle="View and manage all loan applications" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Application</Button>
        </div>

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
                {filtered.map(loan => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{loan.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{loan.date}</td>
                    <td className="px-5 py-3 font-medium">{loan.employeeName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{loan.loanType}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(loan.requestedAmount)}</td>
                    <td className="px-5 py-3">{loan.repaymentPeriod}m</td>
                    <td className="px-5 py-3 text-right">{loan.monthlyInstallment ? fmt(loan.monthlyInstallment) : "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(loan)}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Loan Application Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([
                ["Application ID", selected.id], ["Date", selected.date],
                ["Employee", selected.employeeName], ["Department", selected.department],
                ["Loan Type", selected.loanType], ["Status", selected.status],
                ["Requested", fmt(selected.requestedAmount)],
                ["Approved", selected.approvedAmount ? fmt(selected.approvedAmount) : "—"],
                ["Interest Rate", `${selected.interestRate}%`], ["Period", `${selected.repaymentPeriod} months`],
                ["Installment", selected.monthlyInstallment ? fmt(selected.monthlyInstallment) : "—"],
                ["Purpose", selected.purpose],
                ["Total Payable", selected.totalPayable ? fmt(selected.totalPayable) : "—"],
                ["Total Paid", fmt(selected.totalPaid)],
                ["Outstanding", selected.outstandingBalance != null ? fmt(selected.outstandingBalance) : "—"],
                ["Next Due", selected.nextDueDate || "—"],
                ["Disbursed On", selected.disbursementDate || "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
