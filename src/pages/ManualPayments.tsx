import React from "react";
import TopBar from "@/components/TopBar";
import { HandCoins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const manualPayments = [
  { id: "MP-001", date: "2025-07-15", employee: "Peter Kamau", loanId: "LA-2025-002", amount: 5000, method: "Cash", receipt: "RCP-4421", receivedBy: "Jane Akinyi" },
  { id: "MP-002", date: "2025-06-30", employee: "David Odhiambo", loanId: "LA-2025-003", amount: 13500, method: "Bank Transfer", receipt: "TRF-8832", receivedBy: "Finance Dept" },
];

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function ManualPayments() {
  return (
    <div>
      <TopBar title="Manual Payments" subtitle="Record manual loan repayments" />
      <div className="p-6 animate-fade-in">
        <div className="flex justify-end mb-4">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Record Payment</Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Payment ID", "Date", "Employee", "Loan ID", "Amount", "Method", "Receipt", "Received By"].map(h => (
                    <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {manualPayments.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-5 py-3 font-medium">{p.employee}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.loanId}</td>
                    <td className="px-5 py-3 text-right font-bold">{fmt(p.amount)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.receipt}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.receivedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {manualPayments.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <HandCoins className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold text-lg">No Manual Payments</h3>
            <p className="text-muted-foreground text-sm mt-1">Manual payments will appear here once recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}
