import React from "react";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { loanApplications } from "@/data/mockData";
import { Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function Disbursements() {
  const approved = loanApplications.filter(l => l.status === "Approved");
  const disbursed = loanApplications.filter(l => ["Active", "Disbursed", "Closed"].includes(l.status));

  return (
    <div>
      <TopBar title="Disbursements" subtitle="Process and track loan disbursements" />
      <div className="p-6 animate-fade-in space-y-6">
        {/* Pending disbursement */}
        {approved.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-sm mb-3">Pending Disbursement</h3>
            <div className="space-y-3">
              {approved.map(loan => (
                <div key={loan.id} className="bg-card rounded-xl border-2 border-dashed border-warning/40 p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-medium">{loan.employeeName} <span className="text-muted-foreground text-sm ml-2">{loan.id}</span></p>
                    <p className="text-sm text-muted-foreground">{loan.loanType} · {fmt(loan.approvedAmount || 0)}</p>
                  </div>
                  <Button size="sm"><Banknote className="w-4 h-4 mr-1" /> Disburse</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disbursement history */}
        <div>
          <h3 className="font-display font-semibold text-sm mb-3">Disbursement History</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {["ID", "Employee", "Loan Type", "Amount", "Disbursed On", "Status"].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {disbursed.map(loan => (
                    <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs">{loan.id}</td>
                      <td className="px-5 py-3 font-medium">{loan.employeeName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{loan.loanType}</td>
                      <td className="px-5 py-3 text-right font-medium">{fmt(loan.approvedAmount || 0)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{loan.disbursementDate || "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
