import React from "react";
import TopBar from "@/components/TopBar";
import { loanTypes } from "@/data/mockData";
import { Settings, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function LoanTypes() {
  return (
    <div>
      <TopBar title="Loan Types" subtitle="Configure loan type settings" />
      <div className="p-6 animate-fade-in">
        <div className="flex justify-end mb-4">
          <Button size="sm"><Settings className="w-4 h-4 mr-1" /> Add Loan Type</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loanTypes.map(lt => (
            <div key={lt.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold">{lt.name}</h3>
                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Range</span><span className="font-medium">{fmt(lt.minAmount)} – {fmt(lt.maxAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max Period</span><span className="font-medium">{lt.maxPeriod} months</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate</span><span className="font-medium">{lt.interestFree ? "Interest Free" : `${lt.interestRate}%`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max Active Loans</span><span className="font-medium">{lt.maxActiveLoans}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deduction</span><span className="font-medium">{lt.deductionMethod}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
