import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import { loanApplications, employees, departmentDistribution } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatusBadge from "@/components/StatusBadge";

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function Reports() {
  return (
    <div>
      <TopBar title="Reports" subtitle="Operational, financial, and management reports" />
      <div className="p-6 animate-fade-in">
        <Tabs defaultValue="operational">
          <TabsList className="mb-6">
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="operational">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">All Loan Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      {["ID", "Employee", "Type", "Amount", "Status", "Date"].map(h => (
                        <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loanApplications.map(l => (
                      <tr key={l.id} className="border-b border-border/50">
                        <td className="px-5 py-2.5 font-mono text-xs">{l.id}</td>
                        <td className="px-5 py-2.5">{l.employeeName}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{l.loanType}</td>
                        <td className="px-5 py-2.5 text-right">{fmt(l.requestedAmount)}</td>
                        <td className="px-5 py-2.5"><StatusBadge status={l.status} /></td>
                        <td className="px-5 py-2.5 text-muted-foreground">{l.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employee">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Employee Loan Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      {["Employee", "Department", "Active Loans", "Outstanding Balance", "Status"].map(h => (
                        <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Outstanding Balance" ? "text-right" : "text-left"} ${h === "Active Loans" ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id} className="border-b border-border/50">
                        <td className="px-5 py-2.5 font-medium">{e.name}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{e.department}</td>
                        <td className="px-5 py-2.5 text-center">{e.activeLoans}</td>
                        <td className="px-5 py-2.5 text-right font-medium">{fmt(e.outstandingBalance)}</td>
                        <td className="px-5 py-2.5"><StatusBadge status={e.activeLoans > 0 ? "Active" : "Clear"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <p className="text-xs text-muted-foreground">Total Disbursed</p>
                <p className="text-xl font-bold font-display mt-1">{fmt(loanApplications.filter(l => ["Active", "Closed", "Disbursed"].includes(l.status)).reduce((s, l) => s + (l.approvedAmount || 0), 0))}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-muted-foreground">Total Recovered</p>
                <p className="text-xl font-bold font-display mt-1">{fmt(loanApplications.reduce((s, l) => s + l.totalPaid, 0))}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
                <p className="text-xl font-bold font-display mt-1">{fmt(loanApplications.filter(l => l.status === "Active").reduce((s, l) => s + (l.outstandingBalance || 0), 0))}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Loan Distribution by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="amount" name="Amount" fill="hsl(217, 72%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
