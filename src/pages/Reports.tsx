import React from "react";
import TopBar from "@/components/TopBar";
import { useLoanApplications, useEmployees } from "@/hooks/useLoans";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useLanguage } from "@/i18n/LanguageContext";
import StatusBadge from "@/components/StatusBadge";
import { fmt } from "@/lib/currency";

export default function Reports() {
  const { t } = useLanguage();
  const { data: applications = [], isLoading } = useLoanApplications();
  const { data: employees = [] } = useEmployees();

  // Department distribution for management tab
  const deptMap: Record<string, { name: string; amount: number; count: number }> = {};
  applications.filter((l: any) => ["Active", "Closed", "Disbursed"].includes(l.status)).forEach((l: any) => {
    const dept = l.employees?.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = { name: dept, amount: 0, count: 0 };
    deptMap[dept].amount += l.approved_amount || l.requested_amount || 0;
    deptMap[dept].count++;
  });

  const totalDisbursed = applications.filter((l: any) => ["Active", "Closed", "Disbursed"].includes(l.status)).reduce((s: number, l: any) => s + (l.approved_amount || l.requested_amount || 0), 0);
  const totalRecovered = applications.reduce((s: number, l: any) => s + (l.total_paid || 0), 0);
  const totalOutstanding = applications.filter((l: any) => l.status === "Active").reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0);

  // Employee loan summary
  const empMap: Record<string, { name: string; department: string; activeLoans: number; outstanding: number }> = {};
  applications.filter((l: any) => l.status === "Active").forEach((l: any) => {
    const empId = l.employee_id;
    if (!empMap[empId]) empMap[empId] = { name: l.employees?.full_name || "", department: l.employees?.department || "", activeLoans: 0, outstanding: 0 };
    empMap[empId].activeLoans++;
    empMap[empId].outstanding += l.outstanding_balance || 0;
  });

  // Gender distribution
  const genderCount: Record<string, number> = {};
  employees.forEach((e: any) => {
    const g = e.gender || "Not Specified";
    genderCount[g] = (genderCount[g] || 0) + 1;
  });
  const genderData = Object.entries(genderCount).map(([name, value]) => ({ name, value }));
  const GENDER_COLORS = ["hsl(217, 72%, 48%)", "hsl(340, 75%, 55%)", "hsl(45, 80%, 50%)"];

  // Gender-wise loan data
  const genderLoanMap: Record<string, { gender: string; count: number; amount: number; outstanding: number }> = {};
  applications.filter((l: any) => ["Active", "Closed", "Disbursed"].includes(l.status)).forEach((l: any) => {
    const emp = employees.find((e: any) => e.id === l.employee_id);
    const g = emp?.gender || "Not Specified";
    if (!genderLoanMap[g]) genderLoanMap[g] = { gender: g, count: 0, amount: 0, outstanding: 0 };
    genderLoanMap[g].count++;
    genderLoanMap[g].amount += l.approved_amount || l.requested_amount || 0;
    genderLoanMap[g].outstanding += l.outstanding_balance || 0;
  });

  return (
    <div>
      <TopBar title={t.rptTitle} subtitle={t.rptSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in">
        <Tabs defaultValue="operational">
          <TabsList className="mb-6">
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="operational">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">All Loan Applications ({applications.length})</h3>
              {isLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-secondary/40">
                      {["ID", "Employee", "Type", "Amount", "Status", "Date"].map(h => (
                        <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {applications.map((l: any) => (
                        <tr key={l.id} className="border-b border-border/50">
                          <td className="px-5 py-2.5 font-mono text-xs">{l.application_number}</td>
                          <td className="px-5 py-2.5">{l.employees?.full_name}</td>
                          <td className="px-5 py-2.5 text-muted-foreground">{l.loan_types?.name}</td>
                          <td className="px-5 py-2.5 text-right">{fmt(l.requested_amount)}</td>
                          <td className="px-5 py-2.5"><StatusBadge status={l.status} /></td>
                          <td className="px-5 py-2.5 text-muted-foreground">{l.application_date}</td>
                        </tr>
                      ))}
                      {applications.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No data</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="employee">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Employee Loan Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary/40">
                    {["Employee", "Department", "Active Loans", "Outstanding Balance", "Status"].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium text-muted-foreground text-xs ${h === "Outstanding Balance" ? "text-right" : "text-left"} ${h === "Active Loans" ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {Object.values(empMap).map((e, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-5 py-2.5 font-medium">{e.name}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{e.department}</td>
                        <td className="px-5 py-2.5 text-center">{e.activeLoans}</td>
                        <td className="px-5 py-2.5 text-right font-medium">{fmt(e.outstanding)}</td>
                        <td className="px-5 py-2.5"><StatusBadge status="Active" /></td>
                      </tr>
                    ))}
                    {Object.keys(empMap).length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No active loans</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="stat-card"><p className="text-xs text-muted-foreground">Total Disbursed</p><p className="text-xl font-bold font-display mt-1">{fmt(totalDisbursed)}</p></div>
              <div className="stat-card"><p className="text-xs text-muted-foreground">Total Recovered</p><p className="text-xl font-bold font-display mt-1">{fmt(totalRecovered)}</p></div>
              <div className="stat-card"><p className="text-xs text-muted-foreground">Total Outstanding</p><p className="text-xl font-bold font-display mt-1">{fmt(totalOutstanding)}</p></div>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Loan Distribution by Department</h3>
              {Object.keys(deptMap).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.values(deptMap)}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="amount" name="Amount" fill="hsl(217, 72%, 48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No data to display</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
