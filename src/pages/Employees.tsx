import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { employees } from "@/data/mockData";
import { Search, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function Employees() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof employees[0] | null>(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Employees" subtitle="Manage employee records" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-72"
            />
          </div>
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Employee ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Position</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs">Salary</th>
                  <th className="text-center px-5 py-3 font-medium text-muted-foreground text-xs">Active Loans</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs">Outstanding</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="text-center px-5 py-3 font-medium text-muted-foreground text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{emp.id}</td>
                    <td className="px-5 py-3 font-medium">{emp.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{emp.department}</td>
                    <td className="px-5 py-3 text-muted-foreground">{emp.position}</td>
                    <td className="px-5 py-3 text-right">{fmt(emp.monthlySalary)}</td>
                    <td className="px-5 py-3 text-center">{emp.activeLoans}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(emp.outstandingBalance)}</td>
                    <td className="px-5 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(emp)}>
                        <Eye className="w-4 h-4" />
                      </Button>
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
          <DialogHeader><DialogTitle>Employee Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([
                ["Employee ID", selected.id], ["Name", selected.name],
                ["Department", selected.department], ["Position", selected.position],
                ["Branch", selected.branch], ["Joined", selected.dateOfEmployment],
                ["Salary", fmt(selected.monthlySalary)], ["Status", selected.status],
                ["Phone", selected.phone], ["Email", selected.email],
                ["Bank Account", selected.bankAccount], ["Active Loans", selected.activeLoans],
                ["Outstanding", fmt(selected.outstandingBalance)],
              ] as [string, string | number][]).map(([label, value]) => (
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
